import { Component, inject, signal, computed, input, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocumentService, DocumentDto, PaginatedDocuments } from '../../Core/services/document.service';
import { ClubResponsabilityService } from '../../Core/services/club-responsability.service';
import { AuthService } from '../../Core/services/auth.service';
import { Loader } from '../../shared/components/loader/loader';
import { PaginationComponent } from '../../shared/components/pagination/pagination';

@Component({
    selector: 'app-club-documents',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, Loader, PaginationComponent],
    templateUrl: './club-documents.html',
    styleUrl: './club-documents.css'
})
export class ClubDocuments {
    private documentService = inject(DocumentService);
    private authService = inject(AuthService);
    public clubResponsabilityService = inject(ClubResponsabilityService);

    clubId = input.required({
        alias: 'clubId',
        transform: (val: string | number) => Number(val)
    });
    currentPage = signal(1);
    pageSize = signal(12);
    activeTab = signal<'all' | 'image' | 'pdf'>('all');
    isUploading = signal(false);

    club = this.clubResponsabilityService.club;

    documentsResource = this.documentService.getDocumentsResource(() => ({
        clubId: this.clubId(),
        page: this.currentPage(),
        limit: this.pageSize(),
        type: this.activeTab()
    }));

    documents = computed(() => this.documentsResource.value()?.data ?? []);
    totalDocuments = computed(() => this.documentsResource.value()?.total ?? 0);
    totalPages = computed(() => this.documentsResource.value()?.lastPage ?? 0);
    isLoading = computed(() => this.documentsResource.isLoading());

    setTab(tab: 'all' | 'image' | 'pdf') {
        this.activeTab.set(tab);
        this.currentPage.set(1);
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
            this.uploadFile(file);
            input.value = '';
        }
    }

    private uploadFile(file: File) {
        const user = this.authService.currentUser();
        const userId = user ? Number(user.id) : 1;
        const clubId = this.clubId();

        if (!clubId) return;

        this.isUploading.set(true);
        this.documentService.upload(clubId, userId, file).subscribe({
            next: () => {
                this.isUploading.set(false);
                this.documentsResource.reload();
            },
            error: (err) => {
                console.error('Upload failed:', err);
                this.isUploading.set(false);
            }
        });
    }

    download(doc: DocumentDto) {
        this.documentService.download(doc.id);
    }

    delete(doc: DocumentDto) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

        this.documentService.delete(doc.id).subscribe({
            next: () => this.documentsResource.reload(),
            error: (err) => console.error('Delete failed:', err)
        });
    }

    getFileIcon(type: string): string {
        if (type.startsWith('image/')) return 'bi-image';
        if (type === 'application/pdf') return 'bi-file-earmark-pdf';
        if (type.includes('word')) return 'bi-file-earmark-word';
        return 'bi-file-earmark';
    }

    formatSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

