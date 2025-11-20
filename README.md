Hello! This is a repository for the Transportation Services database and event calendar.

The calendar web application can be accessed here:
https://hty1206.github.io/LIS640_database/

The database was created in MySQL. To create your own copy of it, follow these steps:
1. Open MySQL Workbench. 
2. Create a new instance or open the desired instance.
3. Go to File > Open SQL Script, then navigate to this directory's "db" folder and select "LIS640_full2.sql".
4. Execute the entire script with Ctrl+Shift+Enter or the first lightning bolt button at the top. You must not select any code in the file, or MySQL will attempt to only run the selection.
5. Refresh the schema on the left. You should see a number of tables on the left and a lot of outputs on the bottom.

For a test query, try the sample below.

Test Query #1
This query attempts to show all events that occured in January 2022 where there was recorded precipitation on that day.

select EventStartDate, EventName, EventDesc, WeatherPrecip, WeatherAvgT from events
join weather on events.EventStartDate = weather.WeatherDate
where EventStartDate between "2022-01-01" and "2022-01-31"
and WeatherPrecip > 0;