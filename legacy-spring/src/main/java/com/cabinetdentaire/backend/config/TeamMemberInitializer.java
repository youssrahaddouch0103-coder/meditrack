package com.cabinetdentaire.backend.config;

import com.cabinetdentaire.backend.entity.MembreEquipe;
import com.cabinetdentaire.backend.repository.TeamMemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class TeamMemberInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(TeamMemberInitializer.class);

    private final TeamMemberRepository teamMemberRepository;

    public TeamMemberInitializer(TeamMemberRepository teamMemberRepository) {
        this.teamMemberRepository = teamMemberRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        seedTeamMemberIfAbsent(
                "Dr Youness Kâa",
                "Chirurgien-dentiste",
                "Chirurgie dentaire, Omnipratique, Soins esthétiques",
                "Chirurgien-dentiste attentif et passionné, il accompagne chaque patient avec professionnalisme et bienveillance.",
                "assets/team-1.png",
                "Dr Youness Kâa, Chirurgien-dentiste au cabinet YT Smile Center",
                1
        );

        seedTeamMemberIfAbsent(
                "Dr Tarik",
                "Chirurgien-dentiste",
                "Chirurgie dentaire, Omnipratique, Soins préventifs",
                "Chirurgien-dentiste attentif et engagé, il veille à offrir à chaque patient des soins de qualité dans un climat de confiance.",
                "assets/team-2.png",
                "Dr Tarik, Chirurgien-dentiste au cabinet YT Smile Center",
                2
        );
    }

    private void seedTeamMemberIfAbsent(String nomComplet, String titre, String specialite,
                                       String description, String photoUrl, String photoAlt,
                                       int ordreAffichage) {
        List<MembreEquipe> allMembers = teamMemberRepository.findAll();
        MembreEquipe member = allMembers.stream()
                .filter(m -> m.getNomComplet() != null && m.getNomComplet().toLowerCase().contains(nomComplet.substring(0, Math.min(6, nomComplet.length())).toLowerCase()))
                .findFirst()
                .orElse(null);

        if (member == null) {
            member = new MembreEquipe();
            member.setNomComplet(nomComplet);
            member.setTitre(titre);
            member.setSpecialite(specialite);
            member.setDescription(description);
            member.setPhotoUrl(photoUrl);
            member.setPhotoAlt(photoAlt);
            member.setOrdreAffichage(ordreAffichage);
            member.setActif(true);

            teamMemberRepository.save(member);
            logger.info("Membre de l'équipe créé en BDD : {}", nomComplet);
        } else {
            // Update clean values to ensure encoding is clean
            member.setNomComplet(nomComplet);
            member.setTitre(titre);
            member.setSpecialite(specialite);
            member.setDescription(description);
            member.setPhotoAlt(photoAlt);
            teamMemberRepository.save(member);
            logger.info("Membre de l'équipe synchronisé en BDD : {}", nomComplet);
        }
    }
}
