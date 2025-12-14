import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from '../../../clubs/entities/club.entity';
import { Category } from '../../../clubs/entities/category.entity';

@Injectable()
export class ClubSeeder {
  constructor(
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
  ) {}

  async seed(categories: Category[]): Promise<Club[]> {
    const clubsData = [
      {
        name: 'Club Tech Innovation',
        slug: 'club-tech-innovation',
        description: 'Club dédié aux nouvelles technologies et à l\'innovation. Nous organisons des hackathons, workshops et meetups pour les passionnés de tech.',
        logo: 'https://ui-avatars.com/api/?name=Tech+Innovation&background=6366f1&color=fff',
        coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
        contactEmail: 'tech.innovation@esprit.tn',
        membershipFeeAmount: 20.00,
        isPublic: true,
        isActive: true,
        creationDate: new Date('2020-09-01'),
        category: categories[0], // Technologie
      },
      {
        name: 'Club Business & Entrepreneuriat',
        slug: 'club-business-entrepreneuriat',
        description: 'Développer l\'esprit entrepreneurial des étudiants à travers des conférences, ateliers et networking events.',
        logo: 'https://ui-avatars.com/api/?name=Business&background=f97316&color=fff',
        coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
        contactEmail: 'business@esprit.tn',
        membershipFeeAmount: 15.00,
        isPublic: true,
        isActive: true,
        creationDate: new Date('2019-10-15'),
        category: categories[1], // Business
      },
      {
        name: 'Club Arts & Culture',
        slug: 'club-arts-culture',
        description: 'Promouvoir les arts et la culture sur le campus : expositions, concerts, théâtre et bien plus encore.',
        logo: 'https://ui-avatars.com/api/?name=Arts+Culture&background=10b981&color=fff',
        coverImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200',
        contactEmail: 'arts.culture@esprit.tn',
        membershipFeeAmount: 10.00,
        isPublic: true,
        isActive: true,
        creationDate: new Date('2018-03-20'),
        category: categories[2], // Arts & Culture
      },
      {
        name: 'Club Sport & Santé',
        slug: 'club-sport-sante',
        description: 'Activités sportives et bien-être pour tous les niveaux. Tournois, entraînements et événements sportifs.',
        logo: 'https://ui-avatars.com/api/?name=Sport&background=ef4444&color=fff',
        coverImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200',
        contactEmail: 'sport.sante@esprit.tn',
        membershipFeeAmount: 25.00,
        isPublic: true,
        isActive: true,
        creationDate: new Date('2017-11-10'),
        category: categories[3], // Sport
      },
    ];

    const clubs: Club[] = [];

    for (const clubData of clubsData) {
      const club = this.clubRepository.create(clubData);
      const saved = await this.clubRepository.save(club);
      clubs.push(saved);
    }

    return clubs;
  }
}
