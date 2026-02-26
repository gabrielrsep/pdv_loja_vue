import { getResourcesPath } from "@/config";
import { ipcMain, BrowserWindow } from "electron";
import logger from 'electron-log'
import fs from 'fs-extra'
import { formatCurrency } from '@/utils'
import { db } from '@/database/database'

export const registerPrintHandlers = () => {
    ipcMain.handle('print:get-printers', async (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (!win) return [];
        return win.webContents.getPrintersAsync();
    });

    ipcMain.handle('print:label', async (_, printerName, content) => {
        let workerWindow = new BrowserWindow({
            width: 500,
            height: 500,
            show: false,
        })
        content = `
        <html><head>
        <style>
            body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .label-container { display: flex; flex-col; align-items: center; text-align: center; width: 100%; max-width: 300px; padding: 20px; }
            h3 { margin: 0 0 5px 0; font-size: 16px; font-weight: 900; }
            p { margin: 0; font-size: 14px; font-weight: 700; color: #64748B; }
            img { width: 150px; height: 150px; margin: 10px 0; image-rendering: pixelated; }
            .code { font-family: monospace; font-size: 12px; font-weight: 700; color: #000; background: #F1F5F9; padding: 4px 8px; border-radius: 4px; }
        </style>
        </head>
        <body>${content}</body></html>`
        workerWindow.loadURL(`data:text/html;charset=UTF-8,${content}`)

        workerWindow.webContents.addListener('did-finish-load', () => {
            workerWindow.webContents.print({
                silent: true,
                printBackground: false,
                deviceName: printerName || undefined
            }, (success, errorType) => {
                if (!success) {
                    logger.error(`Print failed: ${errorType}`)
                }
                workerWindow.close()
                workerWindow = null
            })
        })
    })

    ipcMain.handle('print:cart', async (_, cart, printerName) => {
        let workerWindow = new BrowserWindow({
            width: 800,
            height: 600,
            show: false,
        });
        const printHtml = getResourcesPath('template_recibo.html')

        let data = fs.readFileSync(printHtml, 'utf-8')
        const cartItemsHtml = cart.items.map(item => {
            return `
            <div class="produto">
                <span class="product-name">${item.name}</span>
                <span>${item.quantity}x${formatCurrency(item.price)}</span>
                <span>Total: ${formatCurrency(item.subtotal)}</span>
            </div>
            `
        }).join('')

        const customer = await db.get('SELECT * FROM customers WHERE id = ?', cart.customer_id)

        data = data.replace('{{produtos}}', cartItemsHtml)
        data = data.replace('{{total}}', formatCurrency(cart.total))
        data = data.replace('{{sale_id}}', cart.sale_id)
        data = data.replace('{{cliente}}', customer.name)
        data = data.replace('{{data}}', cart.date)
        workerWindow.loadURL(`data:text/html;charset=UTF-8,${data}`)

        workerWindow.webContents.addListener('did-finish-load', () => {
            workerWindow.webContents.print({
                silent: true,
                printBackground: false,
                deviceName: printerName || undefined
            }, (success, errorType) => {
                if (!success) {
                    logger.error(`Print failed: ${errorType}`)
                }
                workerWindow.close()
                workerWindow = null
            })
        })
    })

}
