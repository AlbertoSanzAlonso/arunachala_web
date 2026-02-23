file_url = "https://vybpihtssncjalbsnbcr.supabase.co/storage/v1/object/public/arunachala-images/gallery/home/0dcd7fe8-1033-4702-861f-ee723a1a3cc7.webp"
bucket_name = "arunachala-images"
print("in?", bucket_name in file_url)
parts = file_url.split(f"/{bucket_name}/")
print("parts:", parts)
if len(parts) > 1:
    file_path = parts[1].split("?")[0]
    print("file_path:", file_path)
