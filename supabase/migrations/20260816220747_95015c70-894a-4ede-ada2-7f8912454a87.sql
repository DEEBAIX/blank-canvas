
CREATE POLICY "docs_read_members" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'project-documents' AND public.is_project_member(((storage.foldername(name))[1])::uuid));

CREATE POLICY "docs_upload_members" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-documents' AND public.can_contribute(((storage.foldername(name))[1])::uuid));

CREATE POLICY "docs_update_members" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'project-documents' AND public.can_contribute(((storage.foldername(name))[1])::uuid));

CREATE POLICY "docs_delete_members" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'project-documents' AND public.can_manage_project(((storage.foldername(name))[1])::uuid));
