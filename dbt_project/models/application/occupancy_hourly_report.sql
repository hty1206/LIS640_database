-- application: a business-facing occupancy hourly report
-- This model demonstrates a final application-level dataset intended for BI consumption.
with base as (
  select * from {{ ref('final_occupancy_event') }}
)
select
  facility_id,
  facility_name,
  occu_day,
  occu_hour,
  occu_park_type,
  occu_count,
  case when event_id is not null then 1 else 0 end as has_event,
  tag_name,
  weather_precip,
  weather_avg_t
from base
-- materialization recommendation: table (partition by occu_day) for BI workloads
