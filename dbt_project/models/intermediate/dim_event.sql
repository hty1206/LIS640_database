-- mart dim_event: lightweight wrapper over the intermediate normalized events
-- keep a mart-level model so we can add business annotations/tests here if needed
select * from {{ ref('events_normalized') }}
