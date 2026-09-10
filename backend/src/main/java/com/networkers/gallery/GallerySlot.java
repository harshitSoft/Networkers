package com.networkers.gallery;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity public class GallerySlot{@Id private Integer slotNumber;@Column(length=1500)private String imageUrl;private LocalDateTime updatedAt;@PrePersist @PreUpdate void update(){updatedAt=LocalDateTime.now();}public Integer getSlotNumber(){return slotNumber;}public void setSlotNumber(Integer v){slotNumber=v;}public String getImageUrl(){return imageUrl;}public void setImageUrl(String v){imageUrl=v;}public LocalDateTime getUpdatedAt(){return updatedAt;}}
