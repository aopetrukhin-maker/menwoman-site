import fs from "node:fs";

const pagePath = "app/page.tsx";
const cssPath = "app/visual-overrides.css";

let text = fs.readFileSync(pagePath, "utf8");

text = text.replace('    label: "Основная цена",', '    label: "Текущая цена",');
text = text.replace('    deadline: "2026-08-18T23:59:59+03:00",', '    deadline: "2026-08-19T23:59:59+03:00",');
text = text.replace('    deadlineLabel: "18 августа в 23:59 МСК",', '    deadlineLabel: "19 августа в 23:59 МСК - повышение уже завтра",');
text = text.replace('  const activeStageIndex = saleSnapshot?.stageIndex ?? 0;', '  const activeStageIndex = saleSnapshot?.stageIndex ?? 1;');
text = text.replaceAll('Выбрать билет от 990 ₽', 'Выбрать билет от 1 490 ₽');

const pairHelperAnchor = 'const getPairPricePerPerson = (price: number) => Math.floor((price * 0.7) / 10) * 10;';
const pairHelper = `${pairHelperAnchor}\n\nconst getPairTotalPrice = (stage: SaleStage, tier: TicketTier) => {\n  if (stage.id === "regular") {\n    const qticketsPairPrices: Record<TicketTier, number> = { start: 2080, reload: 4180, vip: 8380 };\n    return qticketsPairPrices[tier];\n  }\n  return getPairPricePerPerson(stage.prices[tier]) * 2;\n};`;

if (!text.includes('const getPairTotalPrice = (stage: SaleStage, tier: TicketTier)')) {
  if (!text.includes(pairHelperAnchor)) throw new Error("Pair price helper anchor not found");
  text = text.replace(pairHelperAnchor, pairHelper);
}

const oldCalc = `  const currentPairPricePerPerson = getPairPricePerPerson(currentSinglePrice);\n  const nextPairPricePerPerson = getPairPricePerPerson(nextSinglePrice);\n  const currentUnitPrice = purchaseMode === "pair" ? currentPairPricePerPerson * 2 : currentSinglePrice;\n  const nextUnitPrice = purchaseMode === "pair" ? nextPairPricePerPerson * 2 : nextSinglePrice;`;
const newCalc = `  const currentPairTotalPrice = getPairTotalPrice(activeStage, calculatorTier);\n  const nextPairTotalPrice = getPairTotalPrice(nextStage, calculatorTier);\n  const currentPairPricePerPerson = Math.floor(currentPairTotalPrice / 2);\n  const nextPairPricePerPerson = Math.floor(nextPairTotalPrice / 2);\n  const currentUnitPrice = purchaseMode === "pair" ? currentPairTotalPrice : currentSinglePrice;\n  const nextUnitPrice = purchaseMode === "pair" ? nextPairTotalPrice : nextSinglePrice;`;

if (text.includes(oldCalc)) text = text.replace(oldCalc, newCalc);
if (!text.includes(newCalc)) throw new Error("Calculator price block not updated");

text = text.replaceAll(
  'getPairPricePerPerson(activeStage.prices[ticket.tier]) * 2',
  'getPairTotalPrice(activeStage, ticket.tier)'
);

const oldHeading = `          <div className={\`price-calculator\${purchaseMode === "pair" ? " is-pair" : ""}\`} id="ticket-calculator" aria-label="Покупка билетов">\n            <div className="price-calculator-heading">\n              <span>Билеты</span>\n              <h3>{purchaseMode === "pair" ? "Купить парный билет" : "Купить билет"}</h3>\n            </div>`;
const newHeading = `          <div className={\`price-calculator\${purchaseMode === "pair" ? " is-pair" : ""}\`} id="ticket-calculator" aria-label="Калькулятор стоимости билетов">\n            <div className="calculator-price-alert">\n              <strong>Цены QTickets сейчас</strong>\n              <span>Повышение 20 августа</span>\n            </div>\n            <div className="price-calculator-heading">\n              <span>Калькулятор билетов</span>\n              <h3>{purchaseMode === "pair" ? "Посчитайте парный билет" : "Посчитайте стоимость за 10 секунд"}</h3>\n              <p className="price-calculator-lead">Выберите формат, тариф и количество - итог пересчитается сразу.</p>\n            </div>`;

if (text.includes(oldHeading)) text = text.replace(oldHeading, newHeading);
if (!text.includes('className="calculator-price-alert"')) throw new Error("Calculator spotlight markup not applied");

fs.writeFileSync(pagePath, text);

let css = fs.readFileSync(cssPath, "utf8");
const marker = "/* Ticket calculator spotlight - 2026-08-19 */";
if (!css.includes(marker)) {
  css += `\n\n${marker}\n.price-calculator {\n  position: relative;\n  overflow: visible !important;\n  border: 3px solid #ea1e63 !important;\n  border-radius: 30px !important;\n  background: linear-gradient(135deg, #ffffff 0%, #fff5f8 52%, #fff0f5 100%) !important;\n  box-shadow: 0 30px 80px rgba(234, 30, 99, .22), 0 10px 28px rgba(33, 25, 22, .10) !important;\n}\n\n.calculator-price-alert {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  margin: -4px 0 18px;\n  padding: 12px 16px;\n  border-radius: 16px;\n  color: #fff;\n  background: linear-gradient(100deg, #ea1e63, #b80c4c);\n  box-shadow: 0 12px 28px rgba(234, 30, 99, .26);\n}\n\n.calculator-price-alert strong {\n  font-size: 14px;\n  font-weight: 950;\n  letter-spacing: .04em;\n  text-transform: uppercase;\n}\n\n.calculator-price-alert span {\n  padding: 6px 10px;\n  border-radius: 999px;\n  color: #7e1239;\n  background: #fff;\n  font-size: 12px;\n  font-weight: 900;\n  white-space: nowrap;\n}\n\n.price-calculator-heading > span {\n  color: #ea1e63 !important;\n  font-weight: 950 !important;\n  letter-spacing: .08em;\n  text-transform: uppercase;\n}\n\n.price-calculator-heading h3 {\n  margin-top: 5px !important;\n  font-size: clamp(30px, 4vw, 48px) !important;\n  line-height: .98 !important;\n  letter-spacing: -.04em !important;\n}\n\n.price-calculator-lead {\n  max-width: 650px;\n  margin: 10px 0 0;\n  color: #6d5860;\n  font-size: 15px;\n  font-weight: 700;\n  line-height: 1.45;\n}\n\n.calculator-tiers button {\n  min-height: 92px !important;\n  border-width: 2px !important;\n}\n\n.calculator-tiers button.is-active {\n  border-color: #ea1e63 !important;\n  box-shadow: 0 12px 30px rgba(234, 30, 99, .16) !important;\n}\n\n.calculator-tiers button strong {\n  font-size: 28px !important;\n  font-weight: 950 !important;\n}\n\n.calculator-result {\n  border: 2px solid rgba(234, 30, 99, .18) !important;\n  background: #fff !important;\n  box-shadow: inset 0 0 0 1px rgba(255,255,255,.8), 0 14px 32px rgba(53, 25, 34, .08) !important;\n}\n\n.calculator-result strong {\n  color: #c70e51 !important;\n  font-size: clamp(30px, 4vw, 44px) !important;\n  font-weight: 950 !important;\n}\n\n.price-calculator > a {\n  min-height: 58px !important;\n  font-size: 16px !important;\n  font-weight: 950 !important;\n  box-shadow: 0 16px 34px rgba(234, 30, 99, .28) !important;\n}\n\n@media (max-width: 720px) {\n  .price-calculator {\n    margin-top: 18px !important;\n    padding: 22px 14px 16px !important;\n    border-radius: 24px !important;\n  }\n\n  .calculator-price-alert {\n    align-items: flex-start;\n    flex-direction: column;\n    margin-bottom: 16px;\n    padding: 12px 13px;\n  }\n\n  .calculator-price-alert span {\n    font-size: 11px;\n  }\n\n  .price-calculator-heading h3 {\n    font-size: 31px !important;\n  }\n\n  .price-calculator-lead {\n    font-size: 13px;\n  }\n\n  .calculator-tiers button {\n    min-height: 84px !important;\n  }\n\n  .calculator-tiers button strong {\n    font-size: 24px !important;\n  }\n\n  .calculator-result strong {\n    font-size: 34px !important;\n  }\n}\n`;
  fs.writeFileSync(cssPath, css);
}
