import JsBarcode from 'jsbarcode';

/**
 * 숫자 바코드를 캔버스에 렌더링
 * @param value 바코드 숫자 (6자리)
 * @param canvas 캔버스 DOM 요소
 */
export function renderBarcodeToCanvas(value: string | number, canvas: HTMLCanvasElement) {
    const barcodeText = String(value).padStart(6, '0');
    JsBarcode(canvas, barcodeText, {
        format: 'CODE128',
        displayValue: true,
        fontSize: 16,
        height: 50,
    });
}
