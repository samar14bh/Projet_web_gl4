
import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
@Directive({
  selector: '[appLazyLoading]'
})
export class LazyLoading implements OnInit, OnDestroy {
  private element = inject(ElementRef);
  private observer?: IntersectionObserver;

  @Input() rootMargin = '50px';
  @Input() threshold = 0.1;
  @Output() visible = new EventEmitter<void>();

  ngOnInit() {
    this.setupObserver();
  }

  private setupObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.visible.emit();
            this.observer?.unobserve(this.element.nativeElement);
          }
        });
      },
      {
        root: null,
        rootMargin: this.rootMargin,
        threshold: this.threshold
      }
    );

    this.observer.observe(this.element.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}


