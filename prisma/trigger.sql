CREATE OR REPLACE FUNCTION alert_post_created() RETURNS trigger AS $$
DECLARE
   new_post_place_id INT;
   new_place_region_id INT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT post_place_id INTO new_post_place_id
        FROM "Post"
        WHERE post_id = NEW.post_id;

        IF new_post_place_id IS NOT NULL THEN
            SELECT place_region_id INTO new_place_region_id
            FROM "Place"
            WHERE place_id = new_post_place_id;
        END IF;
        
        IF new_place_region_id IS NOT NULL THEN
            INSERT INTO "Alerts" (alert_post_id, alert_region_id, alert_place_id) VALUES (NEW.post_id, new_place_region_id, new_post_place_id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_alert_post_created
AFTER INSERT
ON "Post"
FOR EACH ROW
EXECUTE FUNCTION alert_post_created();


CREATE OR REPLACE FUNCTION notify_alert_insert() RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('alert_insert', NEW.alert_id::TEXT);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_alert_insert
AFTER INSERT
ON "Alert"
FOR EACH ROW
EXECUTE FUNCTION notify_alert_insert();