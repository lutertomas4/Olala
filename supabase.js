// ==========================================================
// CLIENTE Y ADAPTADOR DE SUPABASE (SALÓN & NAILS)
// ==========================================================

// Configuración por defecto (Tu proyecto de Supabase)
const DEFAULT_SUPABASE_URL = "https://wonjvkeqkbtjyydgfsik.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_eUm_IQCZe3ZTrRqPMf3ozg_MNilEPZ5";

let supabaseClient = null;
let isOnlineSupabase = false;

function initSupabase() {
  const url = localStorage.getItem('SALON_SUPABASE_URL') || DEFAULT_SUPABASE_URL;
  const key = localStorage.getItem('SALON_SUPABASE_KEY') || DEFAULT_SUPABASE_ANON_KEY;

  if (url && key && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(url, key);
      isOnlineSupabase = true;
      console.log('⚡ Conectado a Supabase en tiempo real');
      return true;
    } catch(e) {
      console.error('Error inicializando Supabase:', e);
      isOnlineSupabase = false;
      return false;
    }
  }
  isOnlineSupabase = false;
  return false;
}

// Inicializar de entrada
initSupabase();

// API Unificada (Si Supabase está conectado usa PostgreSQL; si no, usa localStorage como fallback)
const DB_API = {
  isOnline() {
    return isOnlineSupabase && supabaseClient !== null;
  },

  // CLIENTAS
  async getClientes() {
    if (this.isOnline()) {
      const { data, error } = await supabaseClient.from('clientes').select('*').order('nombre');
      if (!error && data) {
        return data.map(c => ({
          id: c.id,
          nombre: c.nombre,
          tel: c.telefono || '',
          cumple: c.cumpleanos || '',
          alerta: c.alerta_capilar || '',
          obs: c.observaciones || ''
        }));
      }
      console.warn('Error leyendo clientes en Supabase, usando local:', error);
    }
    return null; // Fallback
  },

  async saveCliente(c) {
    if (this.isOnline()) {
      const payload = {
        id: c.id,
        nombre: c.nombre,
        telefono: c.tel,
        cumpleanos: c.cumple || null,
        alerta_capilar: c.alerta,
        observaciones: c.obs
      };
      const { error } = await supabaseClient.from('clientes').upsert(payload);
      if (error) console.error('Error guardando cliente en Supabase:', error);
    }
  },

  async deleteCliente(id) {
    if (this.isOnline()) {
      await supabaseClient.from('clientes').delete().eq('id', id);
    }
  },

  // VISITAS PELUQUERÍA (Yamina)
  async getVisitas() {
    if (this.isOnline()) {
      const { data, error } = await supabaseClient.from('visitas_pelo').select('*').order('fecha', { ascending: false });
      if (!error && data) {
        return data.map(v => ({
          id: Number(v.id),
          cid: v.cliente_id,
          fecha: v.fecha,
          servicio: v.servicio,
          formula: v.formula || '',
          total: Number(v.total || 0),
          pago: v.pago || 'Efectivo'
        }));
      }
      console.warn('Error leyendo visitas en Supabase:', error);
    }
    return null;
  },

  async saveVisita(v) {
    if (this.isOnline()) {
      const payload = {
        id: v.id,
        cliente_id: v.cid,
        fecha: v.fecha,
        servicio: v.servicio,
        formula: v.formula,
        total: v.total,
        pago: v.pago
      };
      const { error } = await supabaseClient.from('visitas_pelo').insert(payload);
      if (error) console.error('Error insertando visita en Supabase:', error);
    }
  },

  async deleteVisita(id) {
    if (this.isOnline()) {
      await supabaseClient.from('visitas_pelo').delete().eq('id', id);
    }
  },

  // TURNOS UÑAS (Katya y Gisel)
  async getTurnos() {
    if (this.isOnline()) {
      const { data, error } = await supabaseClient.from('turnos_unas').select('*').order('fecha', { ascending: false });
      if (!error && data) {
        return data.map(t => ({
          id: Number(t.id),
          mId: t.manicurista_id,
          fecha: t.fecha,
          inicio: t.hora_inicio,
          fin: t.hora_fin,
          cid: t.cliente_id,
          clientaManual: t.cliente_nombre,
          trabajo: t.trabajo,
          detalle: t.detalle || '',
          monto: Number(t.monto || 0),
          pago: t.pago || 'Efectivo'
        }));
      }
      console.warn('Error leyendo turnos en Supabase:', error);
    }
    return null;
  },

  async saveTurno(t) {
    if (this.isOnline()) {
      const payload = {
        id: t.id,
        manicurista_id: t.mId,
        manicurista_nombre: t.mId === 'katya' ? 'Katya' : 'Gisel',
        fecha: t.fecha,
        hora_inicio: t.inicio,
        hora_fin: t.fin,
        cliente_id: t.cid || null,
        cliente_nombre: t.clientaManual || 'Clienta',
        trabajo: t.trabajo,
        detalle: t.detalle,
        monto: t.monto,
        pago: t.pago
      };
      const { error } = await supabaseClient.from('turnos_unas').insert(payload);
      if (error) console.error('Error insertando turno en Supabase:', error);
    }
  },

  async deleteTurno(id) {
    if (this.isOnline()) {
      await supabaseClient.from('turnos_unas').delete().eq('id', id);
    }
  },

  // SUSCRIPCIÓN EN TIEMPO REAL (Realtime)
  subscribeRealtime(onCambioTurnos, onCambioVisitas, onCambioClientes) {
    if (!this.isOnline()) return;

    try {
      supabaseClient
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'turnos_unas' }, payload => {
          console.log('🔄 Cambio en vivo de Turnos Uñas:', payload);
          onCambioTurnos && onCambioTurnos(payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'visitas_pelo' }, payload => {
          console.log('🔄 Cambio en vivo de Visitas Peluquería:', payload);
          onCambioVisitas && onCambioVisitas(payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, payload => {
          console.log('🔄 Cambio en vivo de Clientes:', payload);
          onCambioClientes && onCambioClientes(payload);
        })
        .subscribe();
    } catch(e) {
      console.error('Error configurando realtime:', e);
    }
  }
};
