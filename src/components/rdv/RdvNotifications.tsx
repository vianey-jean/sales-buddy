import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  BellRing,
  Calendar,
  Clock,
  CheckCircle,
  X,
  Phone,
  MapPin,
  Eye
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { rdvNotificationsApi, RdvNotification } from '@/services/api/rdvNotificationsApi';

interface RdvNotificationsProps {
  onCheckNotifications?: () => void;
}

const shouldBlink = (notification: RdvNotification): boolean => {
  const now = new Date();
  const rdvDateTime = new Date(`${notification.rdvDate}T${notification.rdvHeureDebut}:00`);
  const hoursUntilRdv = (rdvDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const hoursAfterRdv = (now.getTime() - rdvDateTime.getTime()) / (1000 * 60 * 60);
  return hoursUntilRdv <= 12 || (hoursAfterRdv > 0 && hoursAfterRdv <= 24);
};

const RdvNotifications: React.FC<RdvNotificationsProps> = ({ onCheckNotifications }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<RdvNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const previousCountRef = useRef<number>(0);
  const [blinkState, setBlinkState] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<RdvNotification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(prev => !prev);
    }, 5000);
    return () => clearInterval(blinkInterval);
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await rdvNotificationsApi.getUnread();
      setNotifications(data);
      if (data.length > previousCountRef.current && previousCountRef.current > 0) {
        toast({
          title: '🔔 Nouvelle notification RDV',
          description: `${data.length - previousCountRef.current} nouveau(x) rendez-vous`,
          duration: 5000,
        });
      }
      previousCountRef.current = data.length;
      setUnreadCount(data.length);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const checkAndCreateNotifications = useCallback(async () => {
    try {
      const result = await rdvNotificationsApi.checkAndCreate();
      if (result.created > 0) {
        toast({
          title: '🔔 Nouvelles notifications',
          description: `${result.created} rendez-vous dans moins de 24h`,
          duration: 800,
        });
        await loadNotifications();
      }
    } catch (error) {
      console.error('Erreur vérification notifications:', error);
    }
  }, [toast, loadNotifications]);

  useEffect(() => {
    loadNotifications();
    checkAndCreateNotifications();
    const interval = setInterval(() => {
      checkAndCreateNotifications();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadNotifications, checkAndCreateNotifications]);

  const handleNotificationClick = async (notification: RdvNotification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
    try {
      await rdvNotificationsApi.markAsRead(notification.id);
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur marquage notification comme lue:', error);
    }
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedNotification(null);
  };

  const handleGoToRdv = () => {
    if (selectedNotification) {
      const rdvDate = selectedNotification.rdvDate;
      navigate(`/rdv?highlightRdv=${selectedNotification.rdvId}&date=${rdvDate}`);
    }
    setShowDetailModal(false);
    setIsOpen(false);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="relative h-10 w-10 rounded-2xl border-orange-200 hover:bg-gradient-to-tr hover:from-orange-50 hover:to-yellow-50 dark:hover:bg-orange-900/20 shadow-lg transition-all duration-300"
            aria-label={`${unreadCount} notifications`}
          >
            {unreadCount > 0 ? (
              <BellRing className="h-5 w-5 text-orange-600 animate-bounce" />
            ) : (
              <Bell className="h-5 w-5 text-muted-foreground" />
            )}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs flex items-center justify-center text-white bg-red-500 animate-pulse shadow-md">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md bg-gradient-to-b from-orange-50/50 via-white/50 to-orange-100/30 dark:from-orange-900/20 dark:via-gray-900/20 dark:to-orange-950/30 backdrop-blur-lg shadow-2xl rounded-2xl p-6">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-xl font-semibold text-orange-700 dark:text-orange-300">
              <BellRing className="h-5 w-5 text-orange-600 animate-pulse" />
              Notifications RDV
              {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
            </SheetTitle>
          </SheetHeader>

          {/* Conteneur scrollable */}
          <div className="mt-6 space-y-4 max-h-[80vh] overflow-y-auto pr-2">
            {loading ? (
              <Card className="shadow-lg border border-orange-200">
                <CardContent className="py-8 text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Chargement...</p>
                </CardContent>
              </Card>
            ) : notifications.length === 0 ? (
              <Card className="shadow-xl border border-green-300">
                <CardContent className="py-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                  <p className="text-muted-foreground text-sm">
                    Aucun rendez-vous dans les prochaines 24h
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <p className="text-sm font-medium text-orange-600 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Rendez-vous dans moins de 24h
                </p>
                {notifications.map((notification) => {
                  const shouldBlinkNow = shouldBlink(notification) && blinkState;
                  return (
                    <Card
                      key={notification.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-2xl border-l-4 rounded-xl",
                        shouldBlink(notification)
                          ? shouldBlinkNow
                            ? "border-l-red-600 bg-red-100 dark:bg-red-950/40"
                            : "border-l-red-500 bg-red-50 dark:bg-red-950/20"
                          : "border-l-orange-500 bg-orange-50 dark:bg-orange-950/20"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardContent className="p-3 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <Clock
                              className={cn(
                                "h-4 w-4 mt-0.5",
                                shouldBlink(notification)
                                  ? shouldBlinkNow
                                    ? "text-red-600 animate-pulse"
                                    : "text-red-500"
                                  : "text-orange-500"
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "font-semibold text-lg truncate",
                                  shouldBlink(notification) &&
                                  shouldBlinkNow &&
                                  "text-red-700 dark:text-red-400"
                                )}
                              >
                                {notification.rdvTitre}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span>{notification.rdvClientNom}</span>
                                <span>:</span>
                                <span>
                                  {notification.rdvHeureDebut} - {notification.rdvHeureFin}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "mt-1 text-xs shadow-sm",
                                  shouldBlink(notification) && "border-red-500 text-red-600"
                                )}
                              >
                                {format(parseISO(notification.rdvDate), "EEEE d MMM", { locale: fr })}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8 flex-shrink-0 rounded-lg hover:scale-110 transition-transform",
                              shouldBlink(notification)
                                ? "text-red-600 hover:bg-red-100"
                                : "text-orange-600 hover:bg-orange-100"
                            )}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        {notification.rdvClientTelephone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <Phone className="h-3 w-3 text-purple-600" />
                            <span>{notification.rdvClientTelephone}</span>
                          </div>
                        )}
                        {notification.rdvLieu && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 text-green-600" />
                            <span className="truncate">{notification.rdvLieu}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-background via-background to-orange-50/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              {selectedNotification?.rdvTitre}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Rendez-vous dans moins de 24 heures
            </DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2 space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-muted/50 to-white/20 shadow-inner space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 shadow">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-semibold text-orange-700 dark:text-orange-300">
                      {format(parseISO(selectedNotification.rdvDate), 'EEEE d MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 shadow">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Horaire</div>
                    <div className="font-semibold text-blue-700 dark:text-blue-300">
                      {selectedNotification.rdvHeureDebut} - {selectedNotification.rdvHeureFin}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 shadow">
                    <Phone className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Client</div>
                    <div className="font-semibold">{selectedNotification.rdvClientNom}</div>
                    {selectedNotification.rdvClientTelephone && (
                      <a
                        href={`tel:${selectedNotification.rdvClientTelephone}`}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        {selectedNotification.rdvClientTelephone}
                      </a>
                    )}
                  </div>
                </div>

                {selectedNotification.rdvLieu && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 shadow">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Lieu</div>
                      <div className="font-semibold">{selectedNotification.rdvLieu}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all shadow-sm"
                  onClick={handleCloseDetail}
                >
                  <X className="h-4 w-4 mr-2" />
                  Fermer
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg"
                  onClick={handleGoToRdv}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Voir le calendrier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RdvNotifications;
