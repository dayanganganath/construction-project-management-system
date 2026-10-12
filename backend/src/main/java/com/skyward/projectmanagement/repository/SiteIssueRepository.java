package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.entity.SiteIssue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SiteIssueRepository
        extends JpaRepository<SiteIssue, Long> {

    List<SiteIssue> findByProjectId(Long projectId);

    List<SiteIssue> findByStatus(SiteIssue.IssueStatus status);

    List<SiteIssue> findByPriority(SiteIssue.Priority priority);

    List<SiteIssue> findByReportedBy(String reportedBy);
}