-- core model: join occupancy with facility, optional event that overlaps the occupancy hour, and weather
with occ as (
  select * from {{ ref('stg_occupancy') }}
),
fac as (
  select * from {{ ref('stg_facilities') }}
),
weather as (
  select * from {{ ref('stg_weather') }}
),
-- events_by_hour provides one row per event-hour; join on exact datetime equality (safer and faster than range scans)
evh as (
  select eb.event_id,
         eb.event_hour,
         eb.tag_id
  from {{ ref('events_by_hour') }} eb
),
events_meta as (
  -- dim_event is the enriched event dimension (standardized times + tag_name)
  select event_id, event_name, tag_name from {{ ref('dim_event') }}
)

select
  o.occu_id,
  o.facility_id,
  f.facility_name,
  o.occu_day,
  o.occu_hour,
  o.occu_park_type,
  o.occu_count,
  w.precip as weather_precip,
  w.temp_min as weather_min_t,
  w.temp_avg as weather_avg_t,
  w.temp_max as weather_max_t,
  evh.event_id,
  em.event_name,
  -- event start/end can be looked up from dim_event if needed
  em.event_name as event_name,
  NULL as event_start,
  NULL as event_end,
  evh.tag_id,
  em.tag_name
from occ o
left join fac f on o.facility_id = f.facility_id
left join weather w on w.weather_date = o.occu_day
-- build occupancy timestamp and join to expanded event hours
left join evh on (
  CAST(CONCAT(o.occu_day, ' ', LPAD(o.occu_hour,2,'0'), ':00:00') AS DATETIME) = evh.event_hour
)
left join events_meta em on evh.event_id = em.event_id
