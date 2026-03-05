-- ============================================================
-- RPC canje: variante que devuelve JSON (para handler /api/enroll/redeem)
-- La lógica atómica sigue en redeem_invitation(p_code, p_user_id).
-- Esta función devuelve jsonb en éxito; en error se propaga RAISE EXCEPTION.
-- ============================================================

CREATE OR REPLACE FUNCTION public.redeem_invitation_json(p_code TEXT, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cohort_id UUID;
BEGIN
  v_cohort_id := public.redeem_invitation(p_code, p_user_id);
  RETURN jsonb_build_object('ok', true, 'cohortId', v_cohort_id);
END;
$$;
