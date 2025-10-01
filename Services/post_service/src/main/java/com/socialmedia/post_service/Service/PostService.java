package com.socialmedia.post_service.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.socialmedia.post_service.Model.Post;
import com.socialmedia.post_service.Repository.PostRepository;

@Service
public class PostService {
    
    @Autowired
    private PostRepository repo;
    @Autowired
    private Cloudinary cloudinary;
    @Autowired
    private PostEventProducer producer;

    public Post createPost(Long userId, String caption, MultipartFile file) throws IOException{
        @SuppressWarnings("rawtypes")
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type","auto"));
        String mediaUrl = uploadResult.get("secure_url").toString();
        Post post = Post.builder()
        .userId(userId)
        .caption(caption)
        .mediaUrl(mediaUrl)
        .build();
        Post saved = repo.save(post);
        producer.sendPostCreatedEvent(saved);
        return post;
    }

    public String createProfilePic(MultipartFile file) throws IOException{
        @SuppressWarnings("rawtypes")
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),ObjectUtils.asMap("resource_type","auto"));
        String profilePicUrl = uploadResult.get("secure_url").toString();
        return profilePicUrl;
    }

    public List<Post> getPostsByUser(Long userId){
        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Post> getFeed(Long userId){
        return repo.findAllByOrderByCreatedAtDesc();
    }

    public void deletePost(Long postId, Long userId){
        Post post = repo.findById(postId).orElseThrow(()-> new RuntimeException("No post found"));
        if(!post.getUserId().equals(userId)){
            throw new RuntimeException("UnAuthorized delete attempt"+userId +" "+ post.getUserId());
        }
        repo.delete(post);
    }

    public List<Post> getAll(){
        return repo.findAll();
    }
}
