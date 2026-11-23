package com.networkers.groups;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "group_categories", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
public class GroupCategory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 80) private String name;
    @Column(length = 300) private String description;
    private boolean active = true;
    private LocalDateTime createdAt;
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }
    public Long getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;}
    public String getDescription(){return description;} public void setDescription(String v){description=v;}
    public boolean isActive(){return active;} public void setActive(boolean v){active=v;} public LocalDateTime getCreatedAt(){return createdAt;}
}
