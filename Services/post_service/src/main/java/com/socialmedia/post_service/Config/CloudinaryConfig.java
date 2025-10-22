package com.socialmedia.post_service.Config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Configuration
public class CloudinaryConfig {

    private String cloudName = "dkmahaywh";

    private String apiKey = "247566332861849";

    private String apiSecret = "alxhRS1CCH7wnsHWsiQhfmT3afU";

    @Bean
    public Cloudinary cloudinary(){
        return new Cloudinary(
            ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
            )
        );
    }
}
