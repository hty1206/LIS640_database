-- staging model for Weather
select
  weatherdate as weather_date,
  weatherprecip as precip,
  weathermint as temp_min,
  weatheravgt as temp_avg,
  weathermaxt as temp_max
from {{ source('mysql_lis640', 'Weather') }}
