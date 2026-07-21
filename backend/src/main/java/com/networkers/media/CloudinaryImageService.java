package com.networkers.media;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.net.URI;

@Service
public class CloudinaryImageService {
    private final Cloudinary cloudinary;
    private final String folderRoot;

    public CloudinaryImageService(@Value("${cloudinary.url:}") String cloudinaryUrl,
                                  @Value("${cloudinary.cloud-name:}") String cloudName,
                                  @Value("${cloudinary.api-key:}") String apiKey,
                                  @Value("${cloudinary.api-secret:}") String apiSecret,
                                  @Value("${cloudinary.folder-root:Networkers}") String folderRoot) {
        this.folderRoot = folderRoot == null || folderRoot.isBlank() ? "Networkers" : folderRoot;
        if (cloudinaryUrl != null && !cloudinaryUrl.isBlank()) {
            this.cloudinary = new Cloudinary(cloudinaryUrl);
        } else if (cloudName != null && !cloudName.isBlank() && apiKey != null && !apiKey.isBlank() && apiSecret != null && !apiSecret.isBlank()) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap("cloud_name", cloudName, "api_key", apiKey, "api_secret", apiSecret));
        } else {
            this.cloudinary = null;
        }
        if (cloudinary != null) cloudinary.config.secure = true;
    }

    public String uploadProfileImage(MultipartFile file, Long userId) throws IOException {
        if (cloudinary == null) {
            throw new IllegalStateException("Image storage is not configured. Set the CLOUDINARY_URL environment variable.");
        }
        Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folderRoot + "/profile-images",
                "public_id", "user-" + userId,
                "overwrite", true,
                "invalidate", true,
                "resource_type", "image"));
        Object secureUrl = result.get("secure_url");
        if (secureUrl == null) throw new IllegalStateException("Cloudinary did not return an image URL");
        return secureUrl.toString();
    }

    public String uploadCommunityMedia(MultipartFile file, Long userId) throws IOException {
        if (cloudinary == null) throw new IllegalStateException("Media storage is not configured. Set the CLOUDINARY_URL environment variable.");
        Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folderRoot + "/meeting-posts",
                "public_id", "member-" + userId + "-" + System.currentTimeMillis(),
                "resource_type", "auto"));
        Object secureUrl = result.get("secure_url");
        if (secureUrl == null) throw new IllegalStateException("Cloudinary did not return a media URL");
        return secureUrl.toString();
    }

    public void deleteCommunityMedia(String mediaUrl,String mediaType) throws IOException {
        if(cloudinary==null||mediaUrl==null||mediaUrl.isBlank())return;
        try{
            String path=URI.create(mediaUrl).getPath();int upload=path.indexOf("/upload/");if(upload<0)return;
            String[] parts=path.substring(upload+8).split("/");int version=-1;for(int i=0;i<parts.length;i++)if(parts[i].matches("v\\d+")){version=i;break;}
            int start=version>=0?version+1:0;if(start>=parts.length)return;String publicId=String.join("/",java.util.Arrays.copyOfRange(parts,start,parts.length));int dot=publicId.lastIndexOf('.');if(dot>publicId.lastIndexOf('/'))publicId=publicId.substring(0,dot);
            cloudinary.uploader().destroy(publicId,ObjectUtils.asMap("resource_type","VIDEO".equalsIgnoreCase(mediaType)?"video":"image","invalidate",true));
        }catch(IllegalArgumentException ignored){}
    }
}
