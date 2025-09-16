package com.socialmedia.chat_service.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.socialmedia.chat_service.Model.ChatModel;

@Repository
public interface ChatRepository extends JpaRepository<ChatModel,String> {
    Optional<ChatModel> findByUserAAndUserB(Long a, Long b);
    List<ChatModel> findByUserAOrUserBOrderByCreatedAtDesc(Long a, Long b);
}
