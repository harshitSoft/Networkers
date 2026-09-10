package com.networkers.gallery;
import com.networkers.common.ApiResponse;
import com.networkers.media.CloudinaryImageService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.*;
@RestController @RequestMapping("/api/gallery") public class GalleryController{
 private static final List<String> DEFAULTS=List.of("/gallery/networkers11.jpeg","/gallery/networkers22.jpg","/gallery/networkers33.jpg","/gallery/networkers44.jpg","/gallery/networkers66.webp","/gallery/networkers99.jpg","/gallery/networkers111.jpg","/gallery/networkers888.jpg","/gallery/networkers6677.jpg");
 private final GallerySlotRepository slots;private final CloudinaryImageService media;public GalleryController(GallerySlotRepository s,CloudinaryImageService m){slots=s;media=m;}
 @GetMapping public ApiResponse<?> all(){Map<Integer,GallerySlot> saved=new HashMap<>();slots.findAll().forEach(s->saved.put(s.getSlotNumber(),s));return ApiResponse.ok("Gallery",java.util.stream.IntStream.rangeClosed(1,9).mapToObj(i->Map.of("slotNumber",i,"imageUrl",saved.containsKey(i)?saved.get(i).getImageUrl():DEFAULTS.get(i-1))).toList());}
 @PutMapping(value="/{slot}",consumes="multipart/form-data") public ApiResponse<?> update(@PathVariable Integer slot,@RequestPart MultipartFile file)throws IOException{if(slot<1||slot>9)throw new IllegalArgumentException("Select a card from 1 to 9");if(file==null||file.isEmpty()||file.getContentType()==null||!file.getContentType().startsWith("image/"))throw new IllegalArgumentException("Choose a valid image file");GallerySlot item=slots.findById(slot).orElseGet(GallerySlot::new);item.setSlotNumber(slot);item.setImageUrl(media.uploadGalleryImage(file,slot));return ApiResponse.ok("Gallery card updated",slots.save(item));}
}
