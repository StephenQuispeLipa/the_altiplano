import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';

const SCROLL_STEP = 160;
const SCROLL_THRESHOLD = 4;

export function useHorizontalScroll(watchSources = []) {
    const containerRef = ref(null);
    const canScrollLeft = ref(false);
    const canScrollRight = ref(false);

    function updateScrollState() {
        const el = containerRef.value;
        if (!el) {
            canScrollLeft.value = false;
            canScrollRight.value = false;
            return;
        }

        const { scrollLeft, scrollWidth, clientWidth } = el;
        const maxScroll = scrollWidth - clientWidth;
        const hasOverflow = maxScroll > SCROLL_THRESHOLD;

        if (!hasOverflow) {
            canScrollLeft.value = false;
            canScrollRight.value = false;
            return;
        }

        canScrollLeft.value = scrollLeft > SCROLL_THRESHOLD;
        canScrollRight.value = scrollLeft < maxScroll - SCROLL_THRESHOLD;
    }

    function scrollLeft() {
        containerRef.value?.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' });
    }

    function scrollRight() {
        containerRef.value?.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
    }

    let resizeObserver = null;

    onMounted(() => {
        nextTick(updateScrollState);

        const el = containerRef.value;
        if (!el) return;

        el.addEventListener('scroll', updateScrollState, { passive: true });
        resizeObserver = new ResizeObserver(() => updateScrollState());
        resizeObserver.observe(el);
        window.addEventListener('resize', updateScrollState);
    });

    onUnmounted(() => {
        const el = containerRef.value;
        if (el) el.removeEventListener('scroll', updateScrollState);
        resizeObserver?.disconnect();
        window.removeEventListener('resize', updateScrollState);
    });

    if (watchSources.length) {
        watch(watchSources, () => nextTick(updateScrollState), { deep: true });
    }

    return {
        containerRef,
        canScrollLeft,
        canScrollRight,
        scrollLeft,
        scrollRight,
        updateScrollState,
    };
}
