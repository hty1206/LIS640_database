-- intermediate: expand events into per-hour rows (MySQL implementation using WITH RECURSIVE)
-- Safety: to avoid exploding events that span very long intervals, cap expansion to 168 hours (configurable in model)

with events_norm as (
  select
    event_id,
    event_name,
    tag_id,
    CAST(event_start AS DATETIME) as event_start,
    CAST(event_end AS DATETIME) as event_end,
    TIMESTAMPDIFF(HOUR, CAST(event_start AS DATETIME), CAST(event_end AS DATETIME)) as hours_span
  from {{ ref('events_normalized') }}
),
events_limit as (
  select
    event_id,
    event_name,
    tag_id,
    event_start,
    case when hours_span > 168 then date_add(event_start, interval 168 hour) else event_end end as expand_end
  from events_norm
),
hours as (
  select
    event_id,
    event_name,
    tag_id,
    event_start as event_hour,
    expand_end
  from events_limit
  union all
  select
    h.event_id,
    h.event_name,
    h.tag_id,
    date_add(h.event_hour, interval 1 hour) as event_hour,
    h.expand_end
  from hours h
  where date_add(h.event_hour, interval 1 hour) <= h.expand_end
)

select
  event_id,
  event_name,
  tag_id,
  event_hour
from hours
-- Note: consider materializing this model as table/incremental for production; if events regularly span >>168 hours,
-- consider alternative strategies (windowing, pre-aggregation, or limiting expansion to recent timeframe).
