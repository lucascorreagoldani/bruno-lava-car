import React, { useState } from "react";
import { Plus, CarFront } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiResponse, WorkOrder } from "@/types";

interface QuickCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickCheckInModal: React.FC<QuickCheckInModalProps> = ({
  isOpen,
  onClose
}) => {
  const queryClient = useQueryClient();
  const [vehiclePlate, setVehiclePlate] = useState("BRA2E19");
  const [clientId, setClientId] = useState("2");
  const [boxId, setBoxId] = useState("1");
  const [serviceIds, setServiceIds] = useState<number[]>([1]);
  const [notes, setNotes] = useState("");

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        clientId: Number(clientId),
        vehiclePlate: vehiclePlate.trim().toUpperCase(),
        boxId: Number(boxId),
        serviceIds,
        notes: notes.trim() ? notes.trim() : undefined
      };

      const res = await api.post<ApiResponse<WorkOrder>>("/v1/work-orders", payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      toast.success(`Ordem ${data.orderNumber} aberta com sucesso! Veículo no pátio.`);
      onClose();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erro ao abrir Ordem de Serviço");
    }
  });

  const toggleService = (id: number) => {
    if (serviceIds.includes(id)) {
      if (serviceIds.length > 1) {
        setServiceIds(serviceIds.filter((s) => s !== id));
      }
    } else {
      setServiceIds([...serviceIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrderMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#121826] border-[#1E2638] text-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <CarFront className="h-4 w-4" />
              </div>
              <DialogTitle className="text-lg font-bold text-white">
                Check-in de Veículo / Nova OS
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-400">
              Registre a entrada do veículo para atendimento no pátio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Placa do Veículo
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                placeholder="Ex: BRA2E19"
                className="w-full uppercase font-mono font-bold rounded-lg border border-[#1E2638] bg-[#0C111C] px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Box de Atendimento
                </label>
                <select
                  value={boxId}
                  onChange={(e) => setBoxId(e.target.value)}
                  className="w-full rounded-lg border border-[#1E2638] bg-[#0C111C] px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="1">Box 1 - Ducha Rápida</option>
                  <option value="2">Box 2 - Lavagem Completa</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Cliente Vinculado
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-lg border border-[#1E2638] bg-[#0C111C] px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="2">Lucas Corrêa Goldani</option>
                  <option value="1">Cliente Padrão</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Serviços a Realizar
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => toggleService(1)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    serviceIds.includes(1)
                      ? "border-sky-500 bg-sky-500/10 text-white font-semibold"
                      : "border-[#1E2638] bg-[#0C111C] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="font-bold text-xs">Lavagem Técnica</div>
                  <div className="text-[11px] text-sky-400 mt-0.5">Ducha + Aspiração</div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleService(2)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    serviceIds.includes(2)
                      ? "border-sky-500 bg-sky-500/10 text-white font-semibold"
                      : "border-[#1E2638] bg-[#0C111C] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="font-bold text-xs">Cera & Proteção UV</div>
                  <div className="text-[11px] text-sky-400 mt-0.5">Brilho + Repelência</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Observações do Atendimento (Opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Atenção especial nas rodas, secagem manual..."
                className="w-full rounded-lg border border-[#1E2638] bg-[#0C111C] p-2.5 text-xs text-white placeholder-slate-400 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={createOrderMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createOrderMutation.isPending}
              className="bg-sky-500 hover:bg-sky-600 text-white gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>{createOrderMutation.isPending ? "Criando..." : "Abrir Ordem"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
