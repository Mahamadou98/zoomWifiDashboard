import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminManagement } from '../AdminManagement';
import { LanguageProvider } from '../../contexts/LanguageContext';

describe('AdminManagement', () => {
  const renderComponent = () => {
    return render(
      <LanguageProvider>
        <AdminManagement />
      </LanguageProvider>
    );
  };

  it('renders admin management section', () => {
    renderComponent();
    expect(screen.getByText('Gestion des Administrateurs')).toBeInTheDocument();
  });

  it('opens create modal when clicking new admin button', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Nouvel Admin'));
    expect(screen.getByText('Créer')).toBeInTheDocument();
  });

  it('validates form fields in create modal', async () => {
    renderComponent();
    fireEvent.click(screen.getByText('Nouvel Admin'));

    const createButton = screen.getByText('Créer');
    expect(createButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Prénom'), {
      target: { value: 'John' }
    });
    fireEvent.change(screen.getByLabelText('Nom'), {
      target: { value: 'Doe' }
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Rôle'), {
      target: { value: '1' }
    });

    expect(createButton).not.toBeDisabled();
  });

  it('shows confirmation modal when deleting admin', () => {
    renderComponent();
    const deleteButtons = screen.getAllByTitle('Supprimer');
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText(/Êtes-vous sûr de vouloir supprimer/)).toBeInTheDocument();
  });

  it('filters admins when searching', () => {
    renderComponent();
    const searchInput = screen.getByPlaceholderText('Rechercher un administrateur...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});