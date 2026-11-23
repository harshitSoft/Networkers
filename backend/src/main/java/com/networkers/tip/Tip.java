package com.networkers.tip;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tips")
public class Tip {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 180) private String title;
    @Column(length = 500) private String shortDescription;
    @Column(nullable = false, columnDefinition = "TEXT") private String content;
    @Column(length = 2048) private String imageUrl;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private TipCategory category;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private TipStatus status = TipStatus.DRAFT;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
    @Column(name = "created_by_id") private Long createdById;
    @PrePersist void created() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate void updated() { updatedAt = LocalDateTime.now(); }
    public Long getId(){return id;} public String getTitle(){return title;} public void setTitle(String v){title=v;}
    public String getShortDescription(){return shortDescription;} public void setShortDescription(String v){shortDescription=v;}
    public String getContent(){return content;} public void setContent(String v){content=v;} public String getImageUrl(){return imageUrl;} public void setImageUrl(String v){imageUrl=v;}
    public TipCategory getCategory(){return category;} public void setCategory(TipCategory v){category=v;} public TipStatus getStatus(){return status;} public void setStatus(TipStatus v){status=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;} public LocalDateTime getPublishedAt(){return publishedAt;} public void setPublishedAt(LocalDateTime v){publishedAt=v;}
    public Long getCreatedById(){return createdById;} public void setCreatedById(Long v){createdById=v;}
}
