import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../../events/entities/event.entity';
import { Club } from '../../../clubs/entities/club.entity';
import { EventStatus, EventType } from '../../../common/enums';

@Injectable()
export class EventSeeder {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async seed(clubs: Club[]): Promise<Event[]> {
    const now = new Date();

    // Helper pour créer des dates relatives
    const addDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const subDays = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const events = [
      // ========== ÉVÉNEMENTS À VENIR (UPCOMING) ==========
      {
        title: 'Hackathon 2025 - IA & Innovation',
        description: 'Rejoignez-nous pour 48h de code intensif ! Créez des solutions innovantes utilisant l\'intelligence artificielle. Prix : 1er prix 5000 TND, 2ème prix 3000 TND, 3ème prix 1500 TND. Repas et boissons fournis. Mentors présents tout le week-end.',
        coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
        startDate: addDays(15),
        endDate: addDays(17),
        address: 'Campus ESPRIT, Bloc C - Salles 301-305',
        capacity: 100,
        memberOnly: false,
        status: EventStatus.UPCOMING,
        sPaid: EventType.HACKATHON,
        subscriptionFees: 50.00,
        club: clubs[0],
      },
      {
        title: 'Workshop: Introduction à React 20',
        description: 'Apprenez les bases de React 20 avec les nouveaux hooks, Signals et les meilleures pratiques. Atelier pratique avec des exercices en temps réel. Apportez votre laptop !',
        coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        startDate: addDays(7),
        endDate: addDays(7),
        address: 'Salle Lab 3, Campus ESPRIT',
        capacity: 30,
        memberOnly: false,
        status: EventStatus.UPCOMING,
        sPaid: EventType.MEET,
        subscriptionFees: 0.00,
        club: clubs[0],
      },
      {
        title: 'Conférence: Entrepreneuriat Digital',
        description: 'Rencontre avec des entrepreneurs tunisiens qui ont réussi dans le digital. Networking et opportunités de stage. Panel de discussion suivi d\'un cocktail networking.',
        coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        startDate: addDays(10),
        endDate: addDays(10),
        address: 'Amphithéâtre A, ESPRIT',
        capacity: 150,
        memberOnly: false,
        status: EventStatus.UPCOMING,
        sPaid: EventType.OTHER,
        subscriptionFees: 0.00,
        club: clubs[1],
      },
      {
        title: 'Team Building: Escape Game',
        description: 'Activité de cohésion d\'équipe dans un escape game thématique. Réservé aux membres du club. Transport inclus. Teamwork et fun garantis !',
        coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
        startDate: addDays(5),
        endDate: addDays(5),
        address: 'Escape Room Revolution, La Marsa',
        capacity: 25,
        memberOnly: true,
        status: EventStatus.UPCOMING,
        sPaid: EventType.TEAM_BUILDING,
        subscriptionFees: 30.00,
        club: clubs[1],
      },
      {
        title: 'Exposition: Art Numérique 2025',
        description: 'Découvrez les créations d\'art numérique de nos étudiants talentueux. Installations interactives, NFT Art, et projections vidéo. Entrée libre.',
        coverImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
        startDate: addDays(20),
        endDate: addDays(22),
        address: 'Hall d\'exposition, ESPRIT - Niveau 0',
        capacity: 200,
        memberOnly: false,
        status: EventStatus.UPCOMING,
        sPaid: EventType.OTHER,
        subscriptionFees: 0.00,
        club: clubs[2],
      },
      {
        title: 'Tournoi de Football Inter-Clubs',
        description: 'Compétition sportive amicale entre les différents clubs du campus. Inscriptions par équipe de 7 joueurs. Médailles et trophées pour les gagnants.',
        coverImage: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
        startDate: addDays(12),
        endDate: addDays(12),
        address: 'Terrain de football, Campus ESPRIT',
        capacity: 50,
        memberOnly: false,
        status: EventStatus.UPCOMING,
        sPaid: EventType.OTHER,
        subscriptionFees: 10.00,
        club: clubs[3],
      },
      {
        title: 'Atelier Yoga & Méditation',
        description: 'Session de bien-être pour déstresser avant les examens. Professeur certifié. Tapis de yoga fournis.',
        coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        startDate: addDays(3),
        endDate: addDays(3),
        address: 'Salle polyvalente, ESPRIT',
        capacity: 40,
        memberOnly: false,
        status: EventStatus.UPCOMING,
        sPaid: EventType.OTHER,
        subscriptionFees: 0.00,
        club: clubs[3],
      },

      // ========== ÉVÉNEMENTS EN COURS (ONGOING) ==========
      {
        title: 'Semaine de l\'Innovation 2025',
        description: 'Une semaine complète d\'ateliers, conférences et démonstrations sur les dernières innovations technologiques. Intelligence artificielle, blockchain, IoT et plus encore !',
        coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
        startDate: subDays(2),
        endDate: addDays(3),
        address: 'Campus ESPRIT - Divers emplacements',
        capacity: 300,
        memberOnly: false,
        status: EventStatus.ONGOING,
        sPaid: EventType.OTHER,
        subscriptionFees: 0.00,
        club: clubs[0],
      },

      // ========== ÉVÉNEMENTS PASSÉS (COMPLETED) ==========
      {
        title: 'Meetup DevOps & Cloud Computing',
        description: 'Retour d\'expérience sur les pratiques DevOps et l\'utilisation du cloud en entreprise. Intervenants de Vermeg et Sofrecom.',
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        startDate: subDays(30),
        endDate: subDays(30),
        address: 'Salle de conférence, ESPRIT',
        capacity: 80,
        memberOnly: false,
        status: EventStatus.COMPLETED,
        sPaid: EventType.MEET,
        subscriptionFees: 0.00,
        club: clubs[0],
      },
      {
        title: 'AG Annuelle du Club Tech',
        description: 'Assemblée générale annuelle avec présentation du bilan, élection du nouveau bureau et perspectives 2025.',
        coverImage: 'https://images.unsplash.com/photo-1511578194003-00c80e42dc9b?w=800',
        startDate: subDays(45),
        endDate: subDays(45),
        address: 'Amphithéâtre B, ESPRIT',
        capacity: 100,
        memberOnly: true,
        status: EventStatus.COMPLETED,
        sPaid: EventType.AG,
        subscriptionFees: 0.00,
        club: clubs[0],
      },
      {
        title: 'Atelier Photographie Professionnelle',
        description: 'Initiation à la photographie avec un photographe professionnel. Techniques de composition, éclairage et post-production.',
        coverImage: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800',
        startDate: subDays(20),
        endDate: subDays(20),
        address: 'Studio photo, ESPRIT',
        capacity: 20,
        memberOnly: false,
        status: EventStatus.COMPLETED,
        sPaid: EventType.OTHER,
        subscriptionFees: 25.00,
        club: clubs[2],
      },
      {
        title: 'Marathon de Tunis 2024',
        description: 'Participation collective au marathon de Tunis. 42 km de défi et de solidarité.',
        coverImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800',
        startDate: subDays(60),
        endDate: subDays(60),
        address: 'Avenue Habib Bourguiba, Tunis',
        capacity: 30,
        memberOnly: false,
        status: EventStatus.COMPLETED,
        sPaid: EventType.OTHER,
        subscriptionFees: 50.00,
        club: clubs[3],
      },
      {
        title: 'Conférence Marketing Digital',
        description: 'Stratégies de marketing digital pour startups. Social media, SEO et growth hacking.',
        coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
        startDate: subDays(15),
        endDate: subDays(15),
        address: 'Salle B201, ESPRIT',
        capacity: 60,
        memberOnly: false,
        status: EventStatus.COMPLETED,
        sPaid: EventType.OTHER,
        subscriptionFees: 0.00,
        club: clubs[1],
      },

      // ========== ÉVÉNEMENTS ANNULÉS (CANCELLED) ==========
      {
        title: 'Soirée Networking - ANNULÉ',
        description: 'Événement annulé en raison de circonstances imprévues. Remboursement automatique pour les inscrits.',
        coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
        startDate: addDays(25),
        endDate: addDays(25),
        address: 'Hôtel Golden Tulip, Tunis',
        capacity: 80,
        memberOnly: false,
        status: EventStatus.CANCELLED,
        sPaid: EventType.OTHER,
        subscriptionFees: 40.00,
        club: clubs[1],
      },
    ];

    const createdEvents = this.eventRepository.create(events);
    const savedEvents = await this.eventRepository.save(createdEvents);

    return savedEvents;
  }
}
