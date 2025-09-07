package com.socialmedia.post_service.Config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import io.github.cdimascio.dotenv.Dotenv;

@Configuration
public class CloudinaryConfig {

    private Dotenv env = Dotenv.load();


    @Bean
    public Cloudinary cloudinary(){
        return new Cloudinary(
            ObjectUtils.asMap(
                "cloud_name",env.get("CLOUD_NAME"),
                "api_key",env.get("API_KEY"),
                "api_secret",env.get("API_SECRET")
            )
        );
    }
}
