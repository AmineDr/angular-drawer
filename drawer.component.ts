import {
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    Renderer2,
} from "@angular/core";

@Component({
    selector: "app-drawer",
    templateUrl: "./drawer.component.html",
    styleUrls: ["./drawer.component.scss"],
})
export class DrawerComponent implements OnInit, OnDestroy {
    @Input() title = "";
    settings = {
        speedOpen: 50,
        speedClose: 350,
        activeClass: "is-active",
        visibleClass: "is-visible",
        selectorTarget: "[data-drawer-target]",
        selectorTrigger: "[data-drawer-trigger]",
        selectorClose: "[data-drawer-close]",
    };

    constructor(private el: ElementRef, private renderer: Renderer2) {
        this.polyfillClosest();
    }

    ngOnInit() {
        this.renderer.listen("document", "click", this.clickHandler.bind(this));
        this.renderer.listen(
            "document",
            "keydown",
            this.keydownHandler.bind(this)
        );
    }

    ngOnDestroy() {
        this.renderer.listen(
            "document",
            "click",
            this.clickHandler.bind(this)
        )();
        this.renderer.listen(
            "document",
            "keydown",
            this.keydownHandler.bind(this)
        )();
    }

    polyfillClosest() {
        if (!Element.prototype.closest) {
            Element.prototype.closest = function (s) {
                let el = this;
                let ancestor = this;
                if (!document.documentElement.contains(el)) return null;
                do {
                    if (ancestor.matches(s)) return ancestor;
                    ancestor = ancestor.parentElement;
                } while (ancestor !== null);
                return null;
            };
        }
    }

    trapFocus(element) {
        const focusableEls = element.querySelectorAll(
            'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
        );
        const firstFocusableEl = focusableEls[0];
        const lastFocusableEl = focusableEls[focusableEls.length - 1];
        const KEYCODE_TAB = 9;

        element.addEventListener("keydown", function (e) {
            const isTabPressed = e.key === "Tab" || e.keyCode === KEYCODE_TAB;
            if (!isTabPressed) {
                return;
            }

            if (e.shiftKey) {
                if (document.activeElement === firstFocusableEl) {
                    lastFocusableEl.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusableEl) {
                    firstFocusableEl.focus();
                    e.preventDefault();
                }
            }
        });
    }

    toggleAccessibility(event) {
        if (event.getAttribute("aria-expanded") === "true") {
            event.setAttribute("aria-expanded", "false");
        } else {
            event.setAttribute("aria-expanded", "true");
        }
    }

    openDrawer(trigger) {
        const target = document.getElementById(
            trigger.getAttribute("aria-controls")
        );
        target.classList.add(this.settings.activeClass);
        document.documentElement.style.overflow = "hidden";
        this.toggleAccessibility(trigger);
        setTimeout(() => {
            target.classList.add(this.settings.visibleClass);
            this.trapFocus(target);
        }, this.settings.speedOpen);
    }

    closeDrawer(event) {
        const closestParent = event.closest(this.settings.selectorTarget);
        const childrenTrigger = document.querySelector(
            `[aria-controls="${closestParent.id}"]`
        );
        closestParent.classList.remove(this.settings.visibleClass);
        document.documentElement.style.overflow = "";
        this.toggleAccessibility(childrenTrigger);
        setTimeout(() => {
            closestParent.classList.remove(this.settings.activeClass);
        }, this.settings.speedClose);
    }

    clickHandler(event) {
        const toggle = event.target;
        const open = toggle.closest(this.settings.selectorTrigger);
        const close = toggle.closest(this.settings.selectorClose);

        if (open) {
            this.openDrawer(open);
        }
        if (close) {
            this.closeDrawer(close);
        }
        if (open || close) {
            event.preventDefault();
        }
    }

    keydownHandler(event) {
        if (event.key === "Escape" || event.keyCode === 27) {
            const drawers = document.querySelectorAll(
                this.settings.selectorTarget
            );
            drawers.forEach((drawer) => {
                if (drawer.classList.contains(this.settings.activeClass)) {
                    this.closeDrawer(drawer);
                }
            });
        }
    }
}
