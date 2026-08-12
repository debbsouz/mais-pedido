"use client";

import {
  CheckCircle,
  X,
} from "@phosphor-icons/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { NewOrderDrawer } from "@/components/pedidos/NewOrderDrawer";
import type { Order } from "@/components/pedidos/OrderCard";
import { OrdersBoard } from "@/components/pedidos/OrdersBoard";
import {
  OrdersFilters,
  type OrderFilter,
} from "@/components/pedidos/OrdersFilters";
import { OrdersHeader } from "@/components/pedidos/OrdersHeader";
import { useOrders } from "@/components/providers/OrdersProvider";

const notificationSettings = {
  enabled: true,
  volume: 0.65,
  repeatUntilHandled: true,
  repeatIntervalSeconds: 10,
  maxDurationMinutes: 5,
};

export default function PedidosPage() {
  const { orders, addOrder, moveOrder, removeOrder } =
    useOrders();

  const [activeFilter, setActiveFilter] =
    useState<OrderFilter>("Todos");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [isNewOrderOpen, setIsNewOrderOpen] =
    useState(false);

  const [notification, setNotification] =
    useState<Order | null>(null);

  const notificationTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  const alarmIntervalRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null,
    );

  const alarmLimitTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  const pendingAlarmOrdersRef =
    useRef<Set<string>>(new Set());

  const openNewOrderDrawer = useCallback(() => {
    setIsNewOrderOpen(true);
  }, []);

  const closeNewOrderDrawer = useCallback(() => {
    setIsNewOrderOpen(false);
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(null);

    if (notificationTimeoutRef.current) {
      clearTimeout(
        notificationTimeoutRef.current,
      );

      notificationTimeoutRef.current = null;
    }
  }, []);

  const stopAlarmTimers = useCallback(() => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }

    if (alarmLimitTimeoutRef.current) {
      clearTimeout(
        alarmLimitTimeoutRef.current,
      );

      alarmLimitTimeoutRef.current = null;
    }
  }, []);

  const playNewOrderSiren = useCallback(() => {
    if (!notificationSettings.enabled) {
      return;
    }

    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      const audioContext =
        new AudioContextClass();

      const oscillator =
        audioContext.createOscillator();

      const gainNode =
        audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = "sawtooth";

      const now = audioContext.currentTime;

      const volume = Math.max(
        0.01,
        Math.min(
          notificationSettings.volume,
          1,
        ),
      );

      oscillator.frequency.setValueAtTime(
        760,
        now,
      );

      oscillator.frequency.setValueAtTime(
        1050,
        now + 0.18,
      );

      oscillator.frequency.setValueAtTime(
        760,
        now + 0.36,
      );

      oscillator.frequency.setValueAtTime(
        1050,
        now + 0.54,
      );

      oscillator.frequency.setValueAtTime(
        760,
        now + 0.72,
      );

      oscillator.frequency.setValueAtTime(
        1050,
        now + 0.9,
      );

      gainNode.gain.setValueAtTime(
        0.0001,
        now,
      );

      gainNode.gain.exponentialRampToValueAtTime(
        volume,
        now + 0.03,
      );

      gainNode.gain.setValueAtTime(
        volume,
        now + 0.95,
      );

      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 1.15,
      );

      oscillator.start(now);
      oscillator.stop(now + 1.15);

      oscillator.addEventListener(
        "ended",
        () => {
          void audioContext.close();
        },
      );
    } catch {
      // O pedido continua funcionando
      // mesmo se o navegador bloquear o áudio.
    }
  }, []);

  const startOrderAlarm = useCallback(
    (orderId: string) => {
      if (!notificationSettings.enabled) {
        return;
      }

      pendingAlarmOrdersRef.current.add(
        orderId,
      );

      playNewOrderSiren();

      if (
        notificationSettings.repeatUntilHandled &&
        !alarmIntervalRef.current
      ) {
        alarmIntervalRef.current =
          setInterval(() => {
            if (
              pendingAlarmOrdersRef.current
                .size === 0
            ) {
              stopAlarmTimers();
              return;
            }

            playNewOrderSiren();
          },
          notificationSettings
            .repeatIntervalSeconds * 1000);
      }

      if (
        alarmLimitTimeoutRef.current
      ) {
        clearTimeout(
          alarmLimitTimeoutRef.current,
        );
      }

      alarmLimitTimeoutRef.current =
        setTimeout(() => {
          pendingAlarmOrdersRef.current.clear();
          stopAlarmTimers();
        },
        notificationSettings
          .maxDurationMinutes *
          60 *
          1000);
    },
    [
      playNewOrderSiren,
      stopAlarmTimers,
    ],
  );

  const handleOrderHandled = useCallback(
    (orderId: string) => {
      pendingAlarmOrdersRef.current.delete(
        orderId,
      );

      if (
        pendingAlarmOrdersRef.current
          .size === 0
      ) {
        stopAlarmTimers();
      }
    },
    [stopAlarmTimers],
  );

  const showNewOrderNotification =
    useCallback((order: Order) => {
      setNotification(order);

      if (
        notificationTimeoutRef.current
      ) {
        clearTimeout(
          notificationTimeoutRef.current,
        );
      }

      notificationTimeoutRef.current =
        setTimeout(() => {
          setNotification(null);
          notificationTimeoutRef.current =
            null;
        }, 6000);
    }, []);

  const handleCreateOrder = useCallback(
    async (order: Order) => {
      const realId = await addOrder(order);

      setIsNewOrderOpen(false);
      setActiveFilter("Todos");
      setSearchTerm("");

      startOrderAlarm(realId ?? order.id);
      showNewOrderNotification({ ...order, id: realId ?? order.id });
    },
    [
      addOrder,
      showNewOrderNotification,
      startOrderAlarm,
    ],
  );

  useEffect(() => {
    return () => {
      if (
        notificationTimeoutRef.current
      ) {
        clearTimeout(
          notificationTimeoutRef.current,
        );
      }

      stopAlarmTimers();
    };
  }, [stopAlarmTimers]);

  return (
    <>
      <OrdersHeader
        onNewOrder={openNewOrderDrawer}
      />

      <OrdersFilters
        activeFilter={activeFilter}
        searchTerm={searchTerm}
        onFilterChange={setActiveFilter}
        onSearchChange={setSearchTerm}
      />

      <OrdersBoard
        activeFilter={activeFilter}
        searchTerm={searchTerm}
        orders={orders}
        onMoveOrder={moveOrder}
        onRemoveOrder={removeOrder}
        onOrderHandled={handleOrderHandled}
      />

      <NewOrderDrawer
        isOpen={isNewOrderOpen}
        onClose={closeNewOrderDrawer}
        onCreateOrder={handleCreateOrder}
      />

      {notification && (
        <aside
          className="new-order-notification"
          role="status"
          aria-live="polite"
        >
          <div className="new-order-notification__icon">
            <CheckCircle
              size={23}
              weight="fill"
            />
          </div>

          <div className="new-order-notification__content">
            <span>Novo pedido criado</span>

            <strong>
              Pedido #{notification.id}
            </strong>

            <small>
              {notification.customer} ·{" "}
              {notification.total}
            </small>
          </div>

          <button
            type="button"
            className="new-order-notification__close"
            onClick={closeNotification}
            aria-label="Fechar notificação"
          >
            <X size={17} />
          </button>
        </aside>
      )}
    </>
  );
}