<template>
  <v-container fluid class="pa-0 animate-fade-in">
    <v-row align="center" class="mb-8">
      <v-col cols="12" md="8">
        <h2 class="font-headline text-h4 font-weight-bold text-primary">Usuarios Staff</h2>
        <p class="text-on-surface-variant text-body-2 mt-1 opacity-80">
          Administra cuentas de administradores y camareros.
        </p>
      </v-col>
      <v-col cols="12" md="4" class="text-md-right">
        <v-btn
          color="primary"
          class="rounded-xl font-weight-bold px-6"
          prepend-icon="mdi-plus"
          @click="openCreate"
        >
          Nuevo usuario
        </v-btn>
      </v-col>
    </v-row>

    <v-card variant="flat" color="surface-container-low" class="rounded-xl overflow-hidden">
      <v-data-table
        :headers="headers"
        :items="usersStore.staffUsers"
        :loading="usersStore.loading"
        class="font-body"
        hover
      >
        <template #item.role="{ item }">
          <v-chip size="small" :color="item.role === 'Admin' ? 'primary' : 'secondary'" variant="flat">
            {{ item.role }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEdit(item)" />
          <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="confirmDelete(item)" />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialogOpen" max-width="520" persistent>
      <v-card class="rounded-xl" color="surface-container-low">
        <v-card-title class="font-headline font-weight-bold pa-6">
          {{ editingUser ? 'Editar usuario' : 'Nuevo usuario staff' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-text-field
              v-model="form.name"
              label="Nombre"
              variant="outlined"
              class="mb-2"
              hide-details="auto"
              :rules="[required()]"
            />
            <v-text-field
              v-model="form.email"
              label="Email"
              variant="outlined"
              class="mb-2"
              hide-details="auto"
              :rules="[required(), emailRule]"
            />
            <v-text-field
              v-model="form.phone"
              label="Teléfono"
              variant="outlined"
              class="mb-2"
              hide-details="auto"
              :rules="[required(), phoneMin7]"
            />
            <v-select
              v-model="form.role"
              :items="['Admin', 'Camarero']"
              label="Rol"
              variant="outlined"
              class="mb-2"
              hide-details="auto"
              :rules="[roleRequired]"
            />
            <PasswordStrengthField
              v-if="!editingUser"
              v-model="form.password"
            />
            <div v-else class="mb-4">
              <v-text-field
                v-model="form.password"
                label="Nueva contraseña (opcional)"
                type="password"
                variant="outlined"
                hide-details="auto"
              />
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-btn variant="text" @click="dialogOpen = false">Cancelar</v-btn>
          <v-spacer />
          <v-btn color="primary" variant="flat" class="font-weight-bold" :loading="saving" @click="handleSave">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog.show" max-width="400">
      <v-card class="rounded-xl" color="surface-container-low">
        <v-card-text class="pa-6 text-center">
          ¿Eliminar a <strong>{{ deleteDialog.user?.name }}</strong>?
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-btn variant="text" @click="deleteDialog.show = false">Cancelar</v-btn>
          <v-spacer />
          <v-btn color="error" variant="flat" @click="handleDelete">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="top">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useUsersStore } from '../../stores/useUsersStore';
import { required, email as emailRule, phoneMin7, roleRequired } from '../../utils/validationRules';
import { isPasswordAcceptable } from '../../utils/passwordStrength';
import PasswordStrengthField from '../../components/auth/PasswordStrengthField.vue';

const usersStore = useUsersStore();
const formRef = ref(null);
const dialogOpen = ref(false);
const saving = ref(false);
const editingUser = ref(null);
const deleteDialog = reactive({ show: false, user: null });
const snackbar = reactive({ show: false, text: '', color: 'success' });

const form = reactive({
  name: '',
  email: '',
  phone: '',
  role: 'Camarero',
  password: '',
});

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Teléfono', key: 'phone' },
  { title: 'Rol', key: 'role' },
  { title: 'Acciones', key: 'actions', sortable: false },
];

function resetForm() {
  form.name = '';
  form.email = '';
  form.phone = '';
  form.role = 'Camarero';
  form.password = '';
}

function openCreate() {
  editingUser.value = null;
  resetForm();
  dialogOpen.value = true;
}

function openEdit(user) {
  editingUser.value = user;
  form.name = user.name;
  form.email = user.email;
  form.phone = user.phone;
  form.role = user.role;
  form.password = '';
  dialogOpen.value = true;
}

function confirmDelete(user) {
  deleteDialog.user = user;
  deleteDialog.show = true;
}

async function handleSave() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  if (!editingUser.value && !isPasswordAcceptable(form.password)) {
    snackbar.text = 'La contraseña debe ser al menos intermedia.';
    snackbar.color = 'error';
    snackbar.show = true;
    return;
  }

  saving.value = true;
  try {
    if (editingUser.value) {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
      };
      if (form.password) payload.password = form.password;
      await usersStore.updateStaffUser(editingUser.value.id, payload);
      snackbar.text = 'Usuario actualizado.';
    } else {
      await usersStore.createStaffUser({ ...form });
      snackbar.text = 'Usuario creado.';
    }
    snackbar.color = 'success';
    snackbar.show = true;
    dialogOpen.value = false;
  } catch (err) {
    snackbar.text = err.message || 'Error al guardar.';
    snackbar.color = 'error';
    snackbar.show = true;
  } finally {
    saving.value = false;
  }
}

async function handleDelete() {
  try {
    await usersStore.deleteStaffUser(deleteDialog.user.id);
    snackbar.text = 'Usuario eliminado.';
    snackbar.color = 'success';
    snackbar.show = true;
  } catch (err) {
    snackbar.text = err.message || 'No se pudo eliminar.';
    snackbar.color = 'error';
    snackbar.show = true;
  } finally {
    deleteDialog.show = false;
  }
}

onMounted(() => usersStore.fetchStaffUsers());
</script>
