package com.socialmedia.user_service.Repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.socialmedia.user_service.Model.UserProfile;

@Repository
public interface UserRepository extends JpaRepository<UserProfile,Long>{
    Optional<UserProfile> findByUsername(String username);

    Optional<UserProfile> findByUserId(Long userId);
}
