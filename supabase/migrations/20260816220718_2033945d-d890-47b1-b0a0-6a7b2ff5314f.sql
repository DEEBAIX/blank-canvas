
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_project_member(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_manage_project(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_contribute(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.shares_project_with_org(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_project_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_project(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_contribute(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_project_with_org(uuid) TO authenticated;
