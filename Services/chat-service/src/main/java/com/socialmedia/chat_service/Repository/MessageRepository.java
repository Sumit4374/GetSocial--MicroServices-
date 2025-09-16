package com.socialmedia.chat_service.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.socialmedia.chat_service.Model.MessageModel;

@Repository
public interface MessageRepository extends JpaRepository<MessageModel,String> {
    List<MessageModel> findByConversationIdOrderByCreatedAtDesc(String conversationId);
}
