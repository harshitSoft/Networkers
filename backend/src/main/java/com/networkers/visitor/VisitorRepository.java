package com.networkers.visitor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface VisitorRepository extends JpaRepository<Visitor,Long>{List<Visitor> findAllByOrderByCreatedAtDesc();}
