-- Seed 80 shipments across Feb 2026
DO $ $ DECLARE v_order_ids INT [];

v_order_id INT;

v_shipment_id BIGINT;

v_status_id INT;

v_carrier_id INT;

v_store_id INT;

v_weight NUMERIC;

v_cod NUMERIC;

v_shipping_fee NUMERIC;

v_base_time TIMESTAMP;

v_picked_at TIMESTAMP;

v_delivered_at TIMESTAMP;

v_code TEXT;

i INT;

v_statuses INT [] := ARRAY [1,2,3,4,5,6,7,7,7,7,7,7,8,8,9];

BEGIN
SELECT
    array_agg(id) INTO v_order_ids
FROM
    (
        SELECT
            id
        FROM
            fact_orders
        WHERE
            status = 'completed'
        ORDER BY
            RANDOM()
        LIMIT
            100
    ) sub;

FOR i IN 1..80 LOOP v_order_id := v_order_ids [1 + (i % array_length(v_order_ids, 1))];

v_status_id := v_statuses [1 + floor(random() * array_length(v_statuses, 1))::int % array_length(v_statuses, 1)];

v_carrier_id := 1 + floor(random() * 5) :: int;

v_store_id := 1 + floor(random() * 4) :: int;

v_weight := round((random() * 25 + 0.5) :: numeric, 2);

v_cod := round((random() * 500000 + 10000) :: numeric, 0);

v_shipping_fee := round((random() * 50000 + 15000) :: numeric, 0);

v_base_time := '2026-02-01' :: timestamp + (random() * 24) :: int * interval '1 day' + (random() * 12 + 7) :: int * interval '1 hour';

v_code := 'SHP-' || to_char(now(), 'YYYYMMDD') || lpad(i :: text, 4, '0');

v_picked_at := NULL;

v_delivered_at := NULL;

IF v_status_id >= 4 THEN v_picked_at := v_base_time + (random() * 120 + 15) :: int * interval '1 minute';

END IF;

IF v_status_id = 7 THEN v_delivered_at := v_picked_at + (random() * 180 + 30) :: int * interval '1 minute';

END IF;

INSERT INTO
    fact_shipments (
        shipment_code,
        order_id,
        carrier_id,
        status_id,
        sender_store_id,
        sender_name,
        sender_phone,
        sender_address,
        recipient_name,
        recipient_phone,
        recipient_address,
        package_weight,
        cod_amount,
        shipping_fee,
        insurance_fee,
        total_fee,
        picked_at,
        delivered_at,
        created_by,
        created_at,
        updated_at
    )
VALUES
    (
        v_code,
        v_order_id,
        v_carrier_id,
        v_status_id,
        v_store_id,
        'MiniMart',
        '0900000001',
        'Hà Nội',
        'Khách hàng ' || i,
        '090' || lpad((1000000 + i) :: text, 7, '0'),
        'Địa chỉ ' || i || ', TP.HCM',
        v_weight,
        v_cod,
        v_shipping_fee,
        0,
        v_shipping_fee,
        v_picked_at,
        v_delivered_at,
        1,
        v_base_time,
        v_base_time
    ) RETURNING id INTO v_shipment_id;

-- Tracking records based on status
INSERT INTO
    fact_shipment_tracking (
        shipment_id,
        status_id,
        description,
        tracked_at,
        created_by
    )
VALUES
    (
        v_shipment_id,
        1,
        'Vận đơn được tạo',
        v_base_time,
        1
    );

IF v_status_id >= 2 THEN
INSERT INTO
    fact_shipment_tracking (
        shipment_id,
        status_id,
        description,
        tracked_at,
        created_by
    )
VALUES
    (
        v_shipment_id,
        2,
        'Đã xác nhận',
        v_base_time + interval '5 minute',
        1
    );

END IF;

IF v_status_id >= 3 THEN
INSERT INTO
    fact_shipment_tracking (
        shipment_id,
        status_id,
        description,
        tracked_at,
        created_by
    )
VALUES
    (
        v_shipment_id,
        3,
        'Đang lấy hàng',
        v_base_time + interval '30 minute',
        1
    );

END IF;

IF v_status_id >= 4 THEN
INSERT INTO
    fact_shipment_tracking (
        shipment_id,
        status_id,
        description,
        tracked_at,
        created_by
    )
VALUES
    (v_shipment_id, 4, 'Đã lấy hàng', v_picked_at, 1);

END IF;

IF v_status_id >= 5 THEN
INSERT INTO
    fact_shipment_tracking (
        shipment_id,
        status_id,
        description,
        tracked_at,
        created_by
    )
VALUES
    (
        v_shipment_id,
        5,
        'Đang vận chuyển',
        v_picked_at + interval '10 minute',
        1
    );

END IF;

IF v_status_id >= 6 THEN
INSERT INTO
    fact_shipment_tracking (
        shipment_id,
        status_id,
        description,
        tracked_at,
        created_by
    )
VALUES
    (
        v_shipment_id,
        6,
        'Đang giao hàng',
        v_picked_at + interval '60 minute',
        1
    );

END IF;

IF v_status_id = 7 THEN
INSERT INTO
    fact_shipment_tracking (
        shipment_id,
        status_id,
        description,
        tracked_at,
        created_by
    )
VALUES
    (
        v_shipment_id,
        7,
        'Giao thành công',
        v_delivered_at,
        1
    );

END IF;

IF v_status_id = 8 THEN
INSERT INTO
    fact_shipment_tracking (
        shipment_id,
        status_id,
        description,
        tracked_at,
        created_by
    )
VALUES
    (
        v_shipment_id,
        8,
        'Giao thất bại',
        v_picked_at + interval '90 minute',
        1
    );

END IF;

IF v_status_id = 9 THEN
INSERT INTO
    fact_shipment_tracking (
        shipment_id,
        status_id,
        description,
        tracked_at,
        created_by
    )
VALUES
    (
        v_shipment_id,
        9,
        'Đã hoàn hàng',
        v_picked_at + interval '120 minute',
        1
    );

END IF;

END LOOP;

END;

$ $;