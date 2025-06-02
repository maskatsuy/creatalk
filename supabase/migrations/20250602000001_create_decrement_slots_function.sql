-- Create function to decrement remaining slots for queue products
CREATE OR REPLACE FUNCTION public.decrement_remaining_slots(product_id UUID)
RETURNS void AS $$
DECLARE
    current_product public.call_products%ROWTYPE;
BEGIN
    -- Get the current product with a lock
    SELECT * INTO current_product
    FROM public.call_products
    WHERE id = product_id
    FOR UPDATE;

    -- Check if product exists and is a queue type
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product not found';
    END IF;

    IF current_product.type != 'queue' THEN
        RAISE EXCEPTION 'Product is not a queue type';
    END IF;

    -- Check if there are remaining slots
    IF current_product.remaining_slots <= 0 THEN
        RAISE EXCEPTION 'No remaining slots available';
    END IF;

    -- Decrement the remaining slots
    UPDATE public.call_products
    SET remaining_slots = remaining_slots - 1,
        status = CASE 
            WHEN remaining_slots - 1 = 0 THEN 'inactive'
            ELSE status
        END
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;