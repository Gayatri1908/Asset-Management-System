package com.niyati.template.service;
import java.util.List;
import com.niyati.template.entity.Notification;

public interface NotificationService {
    List<Notification> getUnreadNotifications(Long userId);
    void markAsRead(Long notificationId);
    void createNotification(Long userId, String message);
}