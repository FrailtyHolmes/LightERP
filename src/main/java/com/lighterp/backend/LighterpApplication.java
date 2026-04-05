package com.lighterp.backend;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.lighterp.backend.mapper")
public class LighterpApplication {
    public static void main(String[] args) {
        SpringApplication.run(LighterpApplication.class, args);
    }
}