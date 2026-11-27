package com.cabinetdentaire.backend.service;

import com.cabinetdentaire.backend.dto.JwtAuthResponse;
import com.cabinetdentaire.backend.dto.LoginRequest;
import com.cabinetdentaire.backend.entity.Utilisateur;
import com.cabinetdentaire.backend.repository.UtilisateurRepository;
import com.cabinetdentaire.backend.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UtilisateurRepository utilisateurRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       UtilisateurRepository utilisateurRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.utilisateurRepository = utilisateurRepository;
    }

    public JwtAuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail().trim(),
                        loginRequest.getMotDePasse()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);

        Utilisateur utilisateur = utilisateurRepository.findByEmail(loginRequest.getEmail().trim())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));

        return new JwtAuthResponse(token, utilisateur.getEmail(), utilisateur.getRole().name());
    }
}
