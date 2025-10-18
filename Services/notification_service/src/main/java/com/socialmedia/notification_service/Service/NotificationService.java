package com.socialmedia.notification_service.Service;

import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.socialmedia.notification_service.Model.Notification;
import com.socialmedia.notification_service.Repository.NotificationRepository;

@Service
public class NotificationService {

    private NotificationRepository repo;
    private SimpMessagingTemplate template;

    public NotificationService(){}
    public NotificationService(NotificationRepository repo, SimpMessagingTemplate template){
        this.repo=repo;
        this.template=template;
    }

    public Notification saveNotification(Notification notification){
        Notification saved = repo.save(notification);
        template.convertAndSend("/topic/user/"+saved.getUserId()+"/notifications",saved);
        return saved;
    }

    public List<Notification> getAllNotifications(Long userId){
        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(Long notificationId){
        repo.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            repo.save(n);
        });
    }
}
