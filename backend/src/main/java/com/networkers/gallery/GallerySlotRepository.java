package com.networkers.gallery;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface GallerySlotRepository extends JpaRepository<GallerySlot,Integer>{List<GallerySlot> findAllByOrderBySlotNumberAsc();}
