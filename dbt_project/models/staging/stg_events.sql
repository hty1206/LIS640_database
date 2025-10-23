-- staging model for Events
select
  eventid as event_id,
  eventname as event_name,
  -- ensure datetime type in staging for downstream consistency (MySQL DATETIME)
  CAST(eventstartdate AS DATETIME) as event_start,
  CAST(eventenddate AS DATETIME) as event_end,
  eventdesc as event_desc,
  tagid as tag_id
from {{ source('mysql_lis640', 'Events') }}
