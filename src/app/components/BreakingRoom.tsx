import React from "react";
import type { ActiveUnit, InventoryItem, ActiveItem, Item } from "../types";
import { ITEMS } from "../data/levels";

interface BreakingRoomProps {
  money: number;
  inventory: InventoryItem[];
  shopItems: ActiveItem[];
  units: ActiveUnit[]; // These are persistentPlayers
  onBuy: (itemId: string) => void;
  onUseItem: (itemId: string, targetUnitId: string) => void;
  onNextLevel: () => void;
}

export const BreakingRoom: React.FC<BreakingRoomProps> = ({
  money,
  inventory,
  shopItems,
  units,
  onBuy,
  onUseItem,
  onNextLevel,
}) => {
  const [activeTab, setActiveTab] = React.useState<"SHOP" | "PARTY">("SHOP");

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
      <div className="flex flex-col w-full max-w-4xl h-[600px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 bg-slate-800 border-b border-slate-700">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            BREAKING ROOM
          </h2>
          <div className="flex gap-6 items-center">
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                Funds
              </span>
              <span className="text-2xl font-bold text-yellow-400">
                {money} G
              </span>
            </div>
            <button
              onClick={onNextLevel}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all"
            >
              CONTINUE JOURNEY
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab("SHOP")}
            className={`flex-1 py-4 font-bold text-lg transition-colors ${
              activeTab === "SHOP"
                ? "bg-slate-800 text-purple-400 border-b-2 border-purple-400"
                : "bg-slate-900 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            }`}
          >
            SHOP
          </button>
          <button
            onClick={() => setActiveTab("PARTY")}
            className={`flex-1 py-4 font-bold text-lg transition-colors ${
              activeTab === "PARTY"
                ? "bg-slate-800 text-blue-400 border-b-2 border-blue-400"
                : "bg-slate-900 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            }`}
          >
            CHECK PARTY
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-900/50">
          {activeTab === "SHOP" && (
            <div className="grid grid-cols-2 gap-4">
              {shopItems.map((shopItem) => {
                const itemDef = ITEMS.find((i) => i.id === shopItem.itemId);
                if (!itemDef) return null;
                const canAfford = money >= itemDef.price;

                return (
                  <div
                    key={shopItem.itemId}
                    className="flex justify-between items-center p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-lg text-slate-200">
                        {itemDef.name}
                      </h4>
                      <p className="text-sm text-slate-400">
                        {itemDef.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Stock: {shopItem.stock}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-bold text-yellow-400">
                        {itemDef.price} G
                      </span>
                      <button
                        onClick={() => onBuy(shopItem.itemId)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-lg font-bold text-sm ${
                          canAfford
                            ? "bg-purple-600 text-white hover:bg-purple-500"
                            : "bg-slate-700 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        BUY
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "PARTY" && (
            <div className="flex flex-col gap-6">
              {/* INVENTORY QUICK VIEW */}
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h4 className="text-slate-400 font-bold mb-2 text-sm uppercase">Inventory</h4>
                {inventory.length === 0 ? (
                  <p className="text-slate-500 text-sm">Empty</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {inventory.map((inv) => {
                       const itemDef = ITEMS.find(i => i.id === inv.itemId);
                       return (
                         <div key={inv.itemId} className="bg-slate-900 px-3 py-1 rounded border border-slate-600 text-sm flex gap-2 items-center">
                            <span className="text-slate-300">{itemDef?.name || "Unknown"}</span>
                            <span className="bg-slate-700 text-white text-xs px-1.5 rounded-full">{inv.quantity}</span>
                         </div>
                       )
                    })}
                  </div>
                )}
              </div>

              {/* UNITS LIST */}
              <div className="grid grid-cols-1 gap-4">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700 items-center"
                  >
                    {/* Unit Icon/Avatar Placeholder */}
                    <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center font-bold text-2xl border-2 border-blue-500 text-blue-200">
                      {unit.displayName.charAt(0)}
                    </div>

                    {/* Stats */}
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-slate-200">
                        {unit.displayName} <span className="text-xs text-slate-400 font-normal">Lvl {unit.baseLevel}</span>
                      </h4>
                      <div className="flex gap-4 mt-2 w-full max-w-md">
                        {/* HP Bar */}
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-green-400 font-bold">HP</span>
                            <span className="text-slate-400">{unit.hp} / {unit.maxHp}</span>
                          </div>
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }}
                            />
                          </div>
                        </div>
                        {/* SP Bar */}
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-blue-400 font-bold">SP</span>
                            <span className="text-slate-400">{unit.sp} / {unit.maxSp}</span>
                          </div>
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${(unit.sp / unit.maxSp) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions (Use Item) */}
                    <div className="flex flex-col gap-2">
                       {inventory.map(inv => {
                          const itemDef = ITEMS.find(i => i.id === inv.itemId);
                          if (!itemDef || itemDef.effectType !== 'SUPPORT') return null; // Only show support items

                          // Basic check if item is useful
                          const isHpFull = unit.hp >= unit.maxHp;
                          const isSpFull = unit.sp >= unit.maxSp;
                          const isHeal = ["1","2","3","4"].includes(itemDef.id);
                          const isSp = ["5","6"].includes(itemDef.id);

                          if ((isHeal && isHpFull) || (isSp && isSpFull)) return null;

                          return (
                            <button
                               key={inv.itemId}
                               onClick={() => onUseItem(inv.itemId, unit.id)}
                               className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded border border-slate-600 transition-colors"
                            >
                               Use {itemDef.name}
                            </button>
                          );
                       })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
