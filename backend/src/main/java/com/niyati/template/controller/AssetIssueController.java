package com.niyati.template.controller;

import com.niyati.template.dto.request.AssetIssueDto;
import com.niyati.template.dto.request.AssetReturnDto;
import com.niyati.template.dto.response.ApiResponse;
import com.niyati.template.service.AssetIssueService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/issues")
public class AssetIssueController {

    @Autowired
    private AssetIssueService issueService;

    @PostMapping("/issue")
    public ResponseEntity<?> issueAsset(@Valid @RequestBody AssetIssueDto dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(new ApiResponse<>(true, "Asset issued successfully", issueService.issueAsset(dto, auth.getName())));
    }

    @PostMapping("/return")
    public ResponseEntity<?> returnAsset(@Valid @RequestBody AssetReturnDto dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Asset returned successfully", issueService.returnAsset(dto)));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Issue history retrieved", issueService.getIssueHistory()));
    }

    @GetMapping("/pending-returns")
    public ResponseEntity<?> getPendingReturns() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Pending returns retrieved", issueService.getPendingReturns()));
    }
}
