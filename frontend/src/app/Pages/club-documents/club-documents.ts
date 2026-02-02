import { Component, inject, signal, computed, input, resource, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../Core/services/document.service';
import { MembershipService } from '../../Core/services/membership.service';
import { AuthService } from '../../Core/services/auth.service';
import { Loader } from '../../shared/components/loader/loader';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { DocumentDto } from '../../Core/dtos/documents/document.dto';
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-club-documents',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, Loader, PaginationComponent, ConfirmModal],
    templateUrl: './club-documents.html',
    styleUrl: './club-documents.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClubDocuments {
    private documentService = inject(DocumentService);
    private authService = inject(AuthService);
    private membershipService = inject(MembershipService);
    private toastr = inject(ToastrService);

    membershipId = input.required({
        alias: 'membershipId',
        transform: (val: string | number) => Number(val)
    });
    currentPage = signal(1);
    pageSize = signal(2);
    activeTab = signal<'all' | 'image' | 'pdf'>('all');
    isUploading = signal(false);
    showConfirmModal = signal(false);
    selectedDoc = signal<DocumentDto | null>(null);


    membership = this.membershipService.getMembership(this.membershipId);

    documentsResource = this.documentService.getDocumentsResource(() => ({
        clubId: this.membership()?.id,
        page: this.currentPage(),
        limit: this.pageSize(),
        type: this.activeTab()
    }));

    documents = computed(() => this.documentsResource.value()?.data ?? []);
    totalDocuments = computed(() => this.documentsResource.value()?.total ?? 0);
    totalPages = computed(() => {
        const total = this.documentsResource.value()?.total ?? 0;
        return Math.ceil(total / this.pageSize());
    });
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
        const clubId = this.membership()?.id;

        if (!clubId) return;

        this.isUploading.set(true);
        this.documentService.upload(clubId, userId, file).subscribe({
            next: () => {
                this.isUploading.set(false);
                this.documentsResource.reload();
                this.toastr.success('Success', 'File uploaded successfully');
            },
            error: (err) => {
                this.toastr.error('Error', 'File upload failed. Please try again.');
                this.isUploading.set(false);
            }
        });
    }

    download(doc: DocumentDto) {
        this.documentService.download(doc.id);
    }

    delete(doc: DocumentDto) {
        this.selectedDoc.set(doc);
        this.showConfirmModal.set(true);
    }

    confirmDelete() {
        const doc = this.selectedDoc();
        if (!doc) return;

        this.documentService.delete(doc.id).subscribe({
            next: () => {
                this.documentsResource.reload();
                this.toastr.success('Success', 'Document deleted successfully');
                this.closeConfirmModal();
            },
            error: (err) => {
                this.toastr.error('Error', 'Validation failed');
                this.closeConfirmModal();
            }
        });
    }

    closeConfirmModal() {
        this.showConfirmModal.set(false);
        this.selectedDoc.set(null);
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

