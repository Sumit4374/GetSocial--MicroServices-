package com.socialmedia.user_service.Model;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name="users_profile")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(nullable = false, unique = true)
    private String username;

    private String name;
    private String bio;
    private String profilePicURL;

    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    @Builder.Default
    @JoinTable(
        name = "followers",
        joinColumns = @JoinColumn(name="user_id"),
        inverseJoinColumns = @JoinColumn(name="follower_id")
    )
    private Set<UserProfile> followers= new HashSet<>();

    @JsonIgnore
    @Builder.Default
    @ManyToMany(mappedBy = "followers", fetch = FetchType.LAZY)
    private Set<UserProfile> following= new HashSet<>();
}
