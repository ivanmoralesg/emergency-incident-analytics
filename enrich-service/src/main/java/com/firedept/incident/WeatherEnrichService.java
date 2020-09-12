package com.firedept.incident;

import static java.util.Collections.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@CrossOrigin
@RestController
public class WeatherEnrichService {

    public static final String JSON_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ssX";
    public static final String METEOSTAT_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${meteostat.api.key}")
    private String meteostatApiKey;

    @Value("${mapbox.access.token}")
    private String mapBoxAccessToken;

    @GetMapping("/mapboxAccessToken")
    public Map<String, String> mapboxAccessToken() {
        return singletonMap("accessToken", mapBoxAccessToken);
    }

    @GetMapping("/weather")
    public Map<String, Object> weatherInfo(@RequestParam double latitude, @RequestParam double longitude,
            @RequestParam @DateTimeFormat(pattern = JSON_DATE_FORMAT) Date startTime) throws ParseException {

        Map<String, Object> requestParams = new HashMap<>();
        requestParams.put("lat", latitude);
        requestParams.put("lon", longitude);
        requestParams.put("startDate", String.format("%tF", startTime));

        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(singletonList(MediaType.APPLICATION_JSON));
        headers.set("x-api-key", meteostatApiKey);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://api.meteostat.net/v2/point/hourly?lat={lat}&lon={lon}&start={startDate}&end={startDate}",
                HttpMethod.GET, new HttpEntity<>(headers), Map.class, requestParams);

        int startHour = toHour(startTime);
        List<Map<String, Object>> hourlyData = (List) response.getBody().get("data");
        SimpleDateFormat dateFormat = new SimpleDateFormat(METEOSTAT_DATE_FORMAT);

        Optional<Map<String, Object>> weatherAtHour = hourlyData.stream().filter(w -> {
            String timeStr = (String) w.get("time");
            try {
                int hour = toHour(dateFormat.parse(timeStr));
                return hour == startHour;
            } catch (ParseException e) {
                System.err.println("Unable to parse Meteostat time: " + timeStr);
                return false;
            }
        }).findFirst();

        return weatherAtHour.orElse(new HashMap<>());

    }

    private int toHour(Date dateTime) {

        Calendar calendar = Calendar.getInstance();
        calendar.setTime(dateTime);

        return calendar.get(Calendar.HOUR_OF_DAY);

    }
}